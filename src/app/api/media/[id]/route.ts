import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import fs from "fs/promises";
import path from "path";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const item = await prisma.mediaItem.findUnique({ where: { id } });

    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    // Remove local file if it exists in uploads
    if (item.url.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", item.url);
      try {
        await fs.unlink(filePath);
      } catch {
        // file might not exist, proceed
      }
    }

    await prisma.mediaItem.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to delete media" }, { status: 500 });
  }
}
