import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/reading-time";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

// GET /api/posts/[id]
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        reviewedBy: true,
        categories: true,
        tags: true,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (err: unknown) {
    console.error("Error fetching single post:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT /api/posts/[id] - update post
export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      featuredImageAlt,
      status,
      authorId,
      reviewedById,
      categoryIds,
      tagIds,
      metaTitle,
      metaDescription,
      canonicalUrl,
      sources,
      isFeatured,
      publishedAt,
    } = body;

    const existing = await prisma.post.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (title) updateData.title = title.trim();
    if (slug) updateData.slug = slugify(slug);
    if (excerpt !== undefined) updateData.excerpt = excerpt.trim();
    if (content) {
      updateData.content = content;
      updateData.readingTime = calculateReadingTime(content);
    }
    if (featuredImage) updateData.featuredImage = featuredImage;
    if (featuredImageAlt !== undefined) updateData.featuredImageAlt = featuredImageAlt;
    if (status) {
      updateData.status = status;
      if (status === "PUBLISHED" && !existing.publishedAt) {
        updateData.publishedAt = new Date();
      }
    }
    if (authorId) updateData.authorId = authorId;
    if (reviewedById !== undefined) updateData.reviewedById = reviewedById || null;
    if (metaTitle !== undefined) updateData.metaTitle = metaTitle;
    if (metaDescription !== undefined) updateData.metaDescription = metaDescription;
    if (canonicalUrl !== undefined) updateData.canonicalUrl = canonicalUrl;
    if (sources !== undefined) {
      updateData.sources = typeof sources === "string" ? sources : JSON.stringify(sources);
    }
    if (isFeatured !== undefined) updateData.isFeatured = Boolean(isFeatured);
    if (publishedAt) updateData.publishedAt = new Date(publishedAt);

    if (Array.isArray(categoryIds)) {
      updateData.categories = {
        set: categoryIds.map((cid: string) => ({ id: cid })),
      };
    }

    if (Array.isArray(tagIds)) {
      updateData.tags = {
        set: tagIds.map((tid: string) => ({ id: tid })),
      };
    }

    const updated = await prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: true,
        reviewedBy: true,
        categories: true,
        tags: true,
      },
    });

    return NextResponse.json({ success: true, post: updated });
  } catch (err: unknown) {
    console.error("Error updating post:", err);
    return NextResponse.json({ error: "Failed to update post." }, { status: 500 });
  }
}

// DELETE /api/posts/[id]
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.post.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error deleting post:", err);
    return NextResponse.json({ error: "Failed to delete post." }, { status: 500 });
  }
}
