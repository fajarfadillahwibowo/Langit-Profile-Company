export function albumPhotos(item) {
    const photos = item?.exif_metadata_json?.sub_photos;
    const valid = Array.isArray(photos) ? photos.filter(url => typeof url === 'string' && url.length > 0) : [];
    return valid.length ? valid : (item?.file_webp_path ? [item.file_webp_path] : []);
}
