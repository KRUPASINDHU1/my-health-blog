/**
 * Client-side image optimization & compression utility
 * 
 * Automatically scales down large photos (e.g. 5MB-15MB) to web-optimized 
 * dimensions (max 1920px) and compresses to WebP/JPEG (~100KB-300KB)
 * before uploading. This ensures instant serverless uploads and prevents 
 * payload size limit errors on Netlify/Vercel.
 */

export interface ProcessedImage {
  dataUri: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
}

export async function processImageForUpload(file: File): Promise<ProcessedImage> {
  // If SVG or non-raster, read directly as Data URI without canvas processing
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUri: reader.result as string,
          filename: file.name,
          originalName: file.name,
          mimeType: file.type,
          size: file.size,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read image file"));
      reader.readAsDataURL(file);
    });
  }

  // Compress raster image (PNG, JPEG, WebP, AVIF) via HTML5 Canvas
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX_DIMENSION = 1920;
        let { width, height } = img;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          if (width > height) {
            height = Math.round((height * MAX_DIMENSION) / width);
            width = MAX_DIMENSION;
          } else {
            width = Math.round((width * MAX_DIMENSION) / height);
            height = MAX_DIMENSION;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve({
            dataUri: e.target?.result as string,
            filename: file.name,
            originalName: file.name,
            mimeType: file.type || "image/jpeg",
            size: file.size,
          });
          return;
        }

        // Draw image onto canvas with high quality smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to WebP format if supported, falling back to JPEG
        let mimeType = "image/webp";
        let dataUri = canvas.toDataURL("image/webp", 0.85);

        if (!dataUri.startsWith("data:image/webp")) {
          mimeType = "image/jpeg";
          dataUri = canvas.toDataURL("image/jpeg", 0.85);
        }

        const approxSize = Math.round((dataUri.length * 3) / 4);
        const dotIndex = file.name.lastIndexOf(".");
        const baseName = dotIndex !== -1 ? file.name.substring(0, dotIndex) : file.name;
        const cleanBase = baseName.replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const ext = mimeType === "image/webp" ? ".webp" : ".jpg";
        const filename = `${cleanBase}${ext}`;

        resolve({
          dataUri,
          filename,
          originalName: file.name,
          mimeType,
          size: approxSize,
        });
      };

      img.onerror = () => reject(new Error("Failed to decode image"));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error("Failed to load file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a processed image to /api/media via JSON payload
 */
export async function uploadImageApi(processed: ProcessedImage, altText: string = ""): Promise<any> {
  const res = await fetch("/api/media", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: processed.dataUri,
      filename: processed.filename,
      originalName: processed.originalName,
      mimeType: processed.mimeType,
      size: processed.size,
      altText,
    }),
  });

  const responseText = await res.text();
  let json: any = null;
  try {
    json = JSON.parse(responseText);
  } catch {
    throw new Error(`Upload failed (${res.status}): ${responseText.slice(0, 150) || "Empty response from server"}`);
  }

  if (!res.ok) {
    throw new Error(json.error || `Upload failed with status ${res.status}`);
  }

  return json.media;
}
