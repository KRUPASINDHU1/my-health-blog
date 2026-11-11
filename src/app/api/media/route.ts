import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const items = await prisma.mediaItem.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ media: items });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch media" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const contentType = req.headers.get("content-type") || "";

    // Support adding media by direct JSON (Optimized Client-side Base64 or Image URL)
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const { url, originalName, altText, data, filename, mimeType, size } = body;

      // Direct Base64 / Data URI upload from optimized client canvas
      if (data && typeof data === "string") {
        const safeName = (filename || originalName || "image.webp").replace(/[^a-zA-Z0-9.\-_]/g, "_");
        const uniqueFilename = `${Date.now()}-${safeName}`;
        let publicUrl = data;

        // Try writing to local public/uploads directory if disk is writable
        try {
          const base64Data = data.includes("base64,") ? data.split("base64,")[1] : data;
          const buffer = Buffer.from(base64Data, "base64");
          const uploadsDir = path.join(process.cwd(), "public", "uploads");
          await fs.mkdir(uploadsDir, { recursive: true });
          const filePath = path.join(uploadsDir, uniqueFilename);
          await fs.writeFile(filePath, buffer);
          publicUrl = `/uploads/${uniqueFilename}`;
        } catch {
          // Read-only filesystem in serverless functions: store Data URI directly
          publicUrl = data;
        }

        const mediaItem = await prisma.mediaItem.create({
          data: {
            filename: uniqueFilename,
            originalName: originalName || filename || "Uploaded Image",
            url: publicUrl,
            mimeType: mimeType || "image/webp",
            size: size || Math.round((data.length * 3) / 4),
            altText: altText || "",
          },
        });

        return NextResponse.json({ success: true, media: mediaItem });
      }

      // External image URL
      if (url && typeof url === "string") {
        const mediaItem = await prisma.mediaItem.create({
          data: {
            filename: originalName || "remote-image",
            originalName: originalName || "External Image",
            url: url.trim(),
            mimeType: mimeType || "image/jpeg",
            size: 0,
            altText: altText || "",
          },
        });
        return NextResponse.json({ success: true, media: mediaItem });
      }

      return NextResponse.json({ error: "Image data or URL is required" }, { status: 400 });
    }

    // Support file uploads
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const altText = (formData.get("altText") as string) || "";

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const timestamp = Date.now();
    const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const uniqueFilename = `${timestamp}-${safeName}`;

    let publicUrl = "";

    // Try saving to disk (local dev / persistent storage)
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads");
      await fs.mkdir(uploadsDir, { recursive: true });
      const filePath = path.join(uploadsDir, uniqueFilename);
      await fs.writeFile(filePath, buffer);
      publicUrl = `/uploads/${uniqueFilename}`;
    } catch (diskErr) {
      // In serverless environments (Netlify / Vercel with read-only filesystems), store as base64 data URI
      console.warn("Serverless read-only filesystem; storing as Data URI:", diskErr);
      const mime = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      publicUrl = `data:${mime};base64,${base64}`;
    }

    const mediaItem = await prisma.mediaItem.create({
      data: {
        filename: uniqueFilename,
        originalName: file.name,
        url: publicUrl,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        altText,
      },
    });

    return NextResponse.json({ success: true, media: mediaItem });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    const msg = err instanceof Error ? err.message : "File upload failed.";
    return NextResponse.json({ error: `File upload failed: ${msg}` }, { status: 500 });
  }
}
