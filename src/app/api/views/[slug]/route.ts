import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    if (!slug) {
      return NextResponse.json({ error: "Article slug is required" }, { status: 400 });
    }

    const post = await prisma.post.update({
      where: { slug },
      data: { viewsCount: { increment: 1 } },
      select: { id: true, slug: true, viewsCount: true },
    });

    return NextResponse.json({ success: true, viewsCount: post.viewsCount });
  } catch (error) {
    console.error("Failed to increment article view count:", error);
    return NextResponse.json({ error: "Failed to record view" }, { status: 500 });
  }
}
