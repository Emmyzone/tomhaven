import { supabase } from "../lib/supabaseClient";

const BUCKET = "product-images";
const MAX_INPUT_BYTES = 10 * 1024 * 1024; // photos straight from a phone camera are big
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIDE = 1200; // pixels
const QUALITY = 0.85;

export function validateImage(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return "Choose a JPG, PNG or WebP photo.";
  }
  if (file.size > MAX_INPUT_BYTES) {
    return "That photo is larger than 10 MB. Choose a smaller one.";
  }
  return null;
}

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("This photo could not be read. Try a different one."));
    };
    img.src = url;
  });
}

// Shrinks the photo so the site stays fast on mobile data.
async function shrinkImage(file) {
  const img = await loadImage(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff"; // PNGs with see-through backgrounds become white
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("This photo could not be prepared."))),
      "image/jpeg",
      QUALITY
    );
  });
}

export async function uploadProductImage(file) {
  const problem = validateImage(file);
  if (problem) throw new Error(problem);

  const blob = await shrinkImage(file);
  const path = `phones/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    cacheControl: "31536000",
  });
  if (error) throw error;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { url: data.publicUrl, path };
}

// Best effort: a leftover file never blocks saving or deleting a product.
export async function deleteProductImage(path) {
  if (!path) return;
  try {
    await supabase.storage.from(BUCKET).remove([path]);
  } catch {
    /* ignore */
  }
}
