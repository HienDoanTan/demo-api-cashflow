export function getExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

export function getFileName(filename) {
    return filename.split('.').shift().toLowerCase();
}