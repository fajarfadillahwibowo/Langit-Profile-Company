export function photoLimitMiB(gallery, services = []) {
    return gallery?.media_type === 'photo' && services.some(service => String(service.id) === String(gallery.service_id) && service.slug === 'photography-videography') ? 5 : 2;
}

export function photoUploadError(file, limitMiB = 2, mixedMedia = false) {
    if (!file) return '';
    const image = file.type?.startsWith('image/');
    if (!image && !mixedMedia) return 'Pilih berkas gambar yang didukung.';
    const limit = image ? limitMiB : 100;
    return file.size > limit * 1024 * 1024 ? `Ukuran ${image ? 'foto' : 'berkas'} maksimal ${limit} MiB per file.` : '';
}

export function guardPhotoSelection(event, limitMiB = 2) {
    const error = photoUploadError(event.target.files?.[0], limitMiB);
    if (!error) return true;
    event.target.value = '';
    alert(error);
    return false;
}
