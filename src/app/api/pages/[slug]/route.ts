import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;
    const page = await prisma.page.findUnique({ where: { slug } });
    if (!page) return NextResponse.json({ error: "Page not found" }, { status: 404 });
    return NextResponse.json({ page });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { slug } = await params;
    const { title, content, metaTitle, metaDescription } = await req.json();

    const page = await prisma.page.upsert({
      where: { slug },
      update: {
        ...(title && { title: title.trim() }),
        ...(content && { content }),
        ...(metaTitle !== undefined && { metaTitle }),
        ...(metaDescription !== undefined && { metaDescription }),
      },
      create: {
        slug,
        title: title || slug,
        content: content || "",
        metaTitle,
        metaDescription,
      },
    });

    return NextResponse.json({ success: true, page });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to update page" }, { status: 500 });
  }
}
