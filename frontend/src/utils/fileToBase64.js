export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) return resolve("");

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}