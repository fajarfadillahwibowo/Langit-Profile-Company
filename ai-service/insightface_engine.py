import base64
import io
import os
import threading
import zipfile
from pathlib import Path
from typing import List, Dict, Any

import cv2
import numpy as np
import onnxruntime as ort
import requests
from PIL import Image, ImageOps

Image.MAX_IMAGE_PIXELS = None

MODELS_DIR = Path(__file__).resolve().parent / "models" / "buffalo_l"
BUFFALO_URL = "https://github.com/deepinsight/insightface/releases/download/v0.7/buffalo_l.zip"

# Template landmark standar ArcFace 112x112
ARCFACE_DST = np.array(
    [
        [38.2946, 51.6963],
        [73.5318, 51.5014],
        [56.0252, 71.7366],
        [41.5493, 92.3655],
        [70.7299, 92.2041],
    ],
    dtype=np.float32,
)


def ensure_models_downloaded() -> None:
    det_path = MODELS_DIR / "det_10g.onnx"
    rec_path = MODELS_DIR / "w600k_r50.onnx"
    if det_path.exists() and rec_path.exists():
        return

    MODELS_DIR.mkdir(parents=True, exist_ok=True)
    zip_path = MODELS_DIR.parent / "buffalo_l.zip"

    if not zip_path.exists():
        print(f"Downloading InsightFace buffalo_l models from {BUFFALO_URL} ...")
        with requests.get(BUFFALO_URL, stream=True, timeout=180) as r:
            r.raise_for_status()
            with open(zip_path, "wb") as f:
                for chunk in r.iter_content(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)

    print("Extracting InsightFace buffalo_l models...")
    with zipfile.ZipFile(zip_path, "r") as zf:
        for member in zf.namelist():
            filename = Path(member).name
            if filename in ("det_10g.onnx", "w600k_r50.onnx"):
                with zf.open(member) as src, open(MODELS_DIR / filename, "wb") as dst:
                    dst.write(src.read())

    if zip_path.exists():
        zip_path.unlink()


class SCRFDDetector:
    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name
        self.center_cache: Dict[tuple, np.ndarray] = {}
        self.fmc = 3
        self._feat_stride_fpn = [8, 16, 32]
        self._num_anchors = 2

    def _get_anchor_centers(self, height: int, width: int, stride: int) -> np.ndarray:
        key = (height, width, stride)
        if key in self.center_cache:
            return self.center_cache[key]

        anchor_centers = np.stack(np.mgrid[:height, :width][::-1], axis=-1).astype(np.float32)
        anchor_centers = (anchor_centers * stride).reshape((-1, 2))
        anchor_centers = np.stack([anchor_centers] * self._num_anchors, axis=1).reshape((-1, 2))
        if len(self.center_cache) < 100:
            self.center_cache[key] = anchor_centers
        return anchor_centers

    @staticmethod
    def _distance2bbox(points: np.ndarray, distance: np.ndarray) -> np.ndarray:
        x1 = points[:, 0] - distance[:, 0]
        y1 = points[:, 1] - distance[:, 1]
        x2 = points[:, 0] + distance[:, 2]
        y2 = points[:, 1] + distance[:, 3]
        return np.stack([x1, y1, x2, y2], axis=-1)

    @staticmethod
    def _distance2kps(points: np.ndarray, distance: np.ndarray) -> np.ndarray:
        preds = []
        for i in range(0, distance.shape[1], 2):
            px = points[:, i % 2] + distance[:, i]
            py = points[:, i % 2 + 1] + distance[:, i + 1]
            preds.append(px)
            preds.append(py)
        return np.stack(preds, axis=-1)

    @staticmethod
    def _nms(dets: np.ndarray, thresh: float = 0.4) -> List[int]:
        x1, y1, x2, y2, scores = dets[:, 0], dets[:, 1], dets[:, 2], dets[:, 3], dets[:, 4]
        areas = (x2 - x1 + 1) * (y2 - y1 + 1)
        order = scores.argsort()[::-1]
        keep = []
        while order.size > 0:
            i = int(order[0])
            keep.append(i)
            xx1 = np.maximum(x1[i], x1[order[1:]])
            yy1 = np.maximum(y1[i], y1[order[1:]])
            xx2 = np.minimum(x2[i], x2[order[1:]])
            yy2 = np.minimum(y2[i], y2[order[1:]])
            w = np.maximum(0.0, xx2 - xx1 + 1)
            h = np.maximum(0.0, yy2 - yy1 + 1)
            inter = w * h
            ovr = inter / (areas[i] + areas[order[1:]] - inter + 1e-6)
            inds = np.where(ovr <= thresh)[0]
            order = order[inds + 1]
        return keep

    def detect(self, bgr_img: np.ndarray, input_size: int = 640, thresh: float = 0.42) -> tuple:
        im_ratio = float(bgr_img.shape[0]) / bgr_img.shape[1]
        if im_ratio > 1.0:
            new_height = input_size
            new_width = int(new_height / im_ratio)
        else:
            new_width = input_size
            new_height = int(new_width * im_ratio)

        det_scale = float(new_height) / bgr_img.shape[0]
        resized_img = cv2.resize(bgr_img, (new_width, new_height))
        det_img = np.zeros((input_size, input_size, 3), dtype=np.uint8)
        det_img[:new_height, :new_width, :] = resized_img

        blob = cv2.dnn.blobFromImage(
            det_img, 1.0 / 128.0, (input_size, input_size), (127.5, 127.5, 127.5), swapRB=True
        )
        net_outs = self.session.run(None, {self.input_name: blob})

        scores_list, bboxes_list, kpss_list = [], [], []
        for idx, stride in enumerate(self._feat_stride_fpn):
            scores = net_outs[idx]
            bbox_preds = net_outs[idx + self.fmc] * stride
            kps_preds = net_outs[idx + self.fmc * 2] * stride

            height = input_size // stride
            width = input_size // stride
            anchor_centers = self._get_anchor_centers(height, width, stride)

            pos_inds = np.where(scores >= thresh)[0]
            if len(pos_inds) == 0:
                continue

            bboxes = self._distance2bbox(anchor_centers, bbox_preds)[pos_inds]
            pos_scores = scores[pos_inds]
            kpss = self._distance2kps(anchor_centers, kps_preds).reshape((-1, 5, 2))[pos_inds]

            scores_list.append(pos_scores)
            bboxes_list.append(bboxes)
            kpss_list.append(kpss)

        if len(scores_list) == 0:
            return np.zeros((0, 5), dtype=np.float32), np.zeros((0, 5, 2), dtype=np.float32)

        scores = np.vstack(scores_list)
        bboxes = np.vstack(bboxes_list) / det_scale
        kpss = np.vstack(kpss_list) / det_scale

        order = scores.ravel().argsort()[::-1]
        pre_det = np.hstack((bboxes, scores)).astype(np.float32, copy=False)[order, :]
        kpss = kpss[order, :, :]

        keep = self._nms(pre_det, 0.4)
        return pre_det[keep, :], kpss[keep, :, :]


class ArcFaceRecognizer:
    def __init__(self, model_path: str):
        self.session = ort.InferenceSession(model_path, providers=["CPUExecutionProvider"])
        self.input_name = self.session.get_inputs()[0].name

    @staticmethod
    def align_face(bgr_img: np.ndarray, kps: np.ndarray) -> np.ndarray:
        M, _ = cv2.estimateAffinePartial2D(kps.astype(np.float32), ARCFACE_DST, method=cv2.LMEDS)
        if M is None:
            return cv2.resize(bgr_img, (112, 112))
        return cv2.warpAffine(bgr_img, M, (112, 112), borderValue=0.0)

    def get_embedding(self, bgr_img: np.ndarray, kps: np.ndarray) -> List[float]:
        aligned = self.align_face(bgr_img, kps)
        blob = cv2.dnn.blobFromImage(
            aligned, 1.0 / 127.5, (112, 112), (127.5, 127.5, 127.5), swapRB=True
        )
        feat = self.session.run(None, {self.input_name: blob})[0][0]
        norm = np.linalg.norm(feat) + 1e-12
        feat = feat / norm
        return [round(float(v), 6) for v in feat]


class InsightFaceEngine:
    def __init__(self):
        ensure_models_downloaded()
        self.detector = SCRFDDetector(str(MODELS_DIR / "det_10g.onnx"))
        self.recognizer = ArcFaceRecognizer(str(MODELS_DIR / "w600k_r50.onnx"))
        self._lock = threading.Lock()

    @staticmethod
    def _decode_image(image_bytes: bytes, mirror_horizontal: bool = False) -> np.ndarray:
        pil_img = Image.open(io.BytesIO(image_bytes))
        pil_img = ImageOps.exif_transpose(pil_img)
        if pil_img.mode != "RGB":
            pil_img = pil_img.convert("RGB")
        if mirror_horizontal:
            pil_img = ImageOps.mirror(pil_img)
        rgb = np.array(pil_img)
        return cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)

    @staticmethod
    def _estimate_pose(kps: np.ndarray) -> tuple:
        left_eye, right_eye, nose = kps[0], kps[1], kps[2]
        eye_mid_x = (left_eye[0] + right_eye[0]) / 2.0
        eye_dist = max(1.0, abs(float(right_eye[0] - left_eye[0])))
        yaw = (float(nose[0]) - float(eye_mid_x)) / eye_dist
        if yaw < -0.16:
            return "side_left", "Samping Kiri (Setengah Wajah)", round(yaw, 3)
        if yaw > 0.16:
            return "side_right", "Samping Kanan (Setengah Wajah)", round(yaw, 3)
        return "frontal", "Wajah Depan", round(yaw, 3)

    @staticmethod
    def _measure_face_quality(bgr_img: np.ndarray, box: np.ndarray) -> tuple:
        h, w = bgr_img.shape[:2]
        x1, y1, x2, y2 = [int(max(0, v)) for v in box[:4]]
        x2 = min(w, x2)
        y2 = min(h, y2)
        crop = bgr_img[y1:y2, x1:x2]
        if crop.size == 0:
            return 0.0, 0.0
        gray = cv2.cvtColor(crop, cv2.COLOR_BGR2GRAY)
        brightness = float(np.mean(gray))
        sharpness = float(cv2.Laplacian(gray, cv2.CV_64F).var())
        return round(brightness, 1), round(sharpness, 1)

    @staticmethod
    def _make_thumb_data_url(bgr_img: np.ndarray, box: np.ndarray) -> str:
        h, w = bgr_img.shape[:2]
        x1, y1, x2, y2 = box[:4]
        bw, bh = x2 - x1, y2 - y1
        cx1 = max(0, int(x1 - bw * 0.22))
        cy1 = max(0, int(y1 - bh * 0.22))
        cx2 = min(w, int(x2 + bw * 0.22))
        cy2 = min(h, int(y2 + bh * 0.22))
        crop = bgr_img[cy1:cy2, cx1:cx2]
        if crop.size == 0:
            return ""
        crop_resized = cv2.resize(crop, (160, 160))
        ok, buf = cv2.imencode(".jpg", crop_resized, [int(cv2.IMWRITE_JPEG_QUALITY), 88])
        if not ok:
            return ""
        return "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode("ascii")

    def analyze_bytes(
        self,
        image_bytes: bytes,
        mirror_horizontal: bool = False,
        include_snapshot: bool = False,
        include_thumbs: bool = True,
    ) -> Dict[str, Any]:
        bgr_img = self._decode_image(image_bytes, mirror_horizontal=mirror_horizontal)
        h, w = bgr_img.shape[:2]

        with self._lock:
            # Pass 1: Deteksi 640px
            bboxes, kpss = self.detector.detect(bgr_img, input_size=640, thresh=0.42)
            # Pass 2: Jika foto beresolusi tinggi / jarak jauh (misal outdoor full-body) belum terdeteksi, coba 1024px thresh 0.35
            if len(bboxes) == 0:
                bboxes, kpss = self.detector.detect(bgr_img, input_size=1024, thresh=0.35)

            faces: List[Dict[str, Any]] = []
            for idx in range(len(bboxes)):
                box = bboxes[idx]
                kps = kpss[idx]
                x1, y1, x2, y2, score = [float(v) for v in box]
                bw = max(0.0, x2 - x1)
                bh = max(0.0, y2 - y1)
                if bw < 14 or bh < 14:
                    continue

                embedding = self.recognizer.get_embedding(bgr_img, kps)
                pose, pose_label, yaw_ratio = self._estimate_pose(kps)
                brightness, sharpness = self._measure_face_quality(bgr_img, box)
                thumb_url = self._make_thumb_data_url(bgr_img, box) if include_thumbs else ""

                faces.append(
                    {
                        "index": len(faces),
                        "confidence_score": round(score, 4),
                        "pose": pose,
                        "pose_label": pose_label,
                        "yaw_ratio": yaw_ratio,
                        "brightness": brightness,
                        "sharpness": sharpness,
                        "face_embedding": embedding,
                        "thumb_url": thumb_url,
                        "bounding_box": {
                            "x": round(max(0.0, x1 / w), 4),
                            "y": round(max(0.0, y1 / h), 4),
                            "width": round(min(1.0, bw / w), 4),
                            "height": round(min(1.0, bh / h), 4),
                            "pose": pose,
                            "yaw_ratio": yaw_ratio,
                        },
                    }
                )

        snapshot_data_url = None
        if include_snapshot:
            max_side = 1280
            scale = min(1.0, max_side / max(w, h))
            snap_img = cv2.resize(bgr_img, (max(1, int(w * scale)), max(1, int(h * scale)))) if scale < 1.0 else bgr_img
            ok, buf = cv2.imencode(".jpg", snap_img, [int(cv2.IMWRITE_JPEG_QUALITY), 90])
            if ok:
                snapshot_data_url = "data:image/jpeg;base64," + base64.b64encode(buf.tobytes()).decode("ascii")

        return {
            "width": w,
            "height": h,
            "engine": "insightface-buffalo_l-arcface-512d",
            "snapshotDataUrl": snapshot_data_url,
            "faces": faces,
        }
