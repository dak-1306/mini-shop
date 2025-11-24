/**
 * Lấy image blob từ dummyjson
 * size: có thể là số (150) hoặc chuỗi (150/200/..)
 * signal: AbortSignal (react-query truyền vào)
 */
export async function getImage(size, signal) {
  if (size == null || size === "") {
    throw new Error("Image size is required");
  }
  const url = `https://dummyjson.com/image/${encodeURIComponent(size)}`;
  const res = await fetch(url, { signal });
  if (!res.ok) {
    throw new Error(`Failed to fetch image (${res.status})`);
  }
  const blob = await res.blob();
  return blob;
}

export default {
  getImage,
};
