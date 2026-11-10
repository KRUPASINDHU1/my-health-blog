import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { calculateReadingTime } from "@/lib/reading-time";
import { slugify } from "@/lib/utils";

// GET /api/posts - list posts with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const q = searchParams.get("q");

    const where: any = {};
    if (status && status !== "ALL") {
      where.status = status;
    }
    if (q) {
      where.OR = [
        { title: { contains: q } },
        { excerpt: { contains: q } },
      ];
    }

    const posts = await prisma.post.findMany({
      where,
      include: {
        author: true,
        reviewedBy: true,
        categories: true,
        tags: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (err: unknown) {
    console.error("Error fetching posts:", err);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

// POST /api/posts - create new post
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      featuredImageAlt,
      status = "PUBLISHED",
      authorId,
      reviewedById,
      categoryIds = [],
      tagIds = [],
      metaTitle,
      metaDescription,
      canonicalUrl,
      sources,
      isFeatured = false,
      publishedAt,
    } = body;

    if (!title || !content || !authorId) {
      return NextResponse.json(
        { error: "Title, content, and author are required." },
        { status: 400 }
      );
    }

    const finalSlug = slug ? slugify(slug) : slugify(title);
    const readingTime = calculateReadingTime(content);

    // Verify slug uniqueness
    const existing = await prisma.post.findUnique({ where: { slug: finalSlug } });
    const uniqueSlug = existing ? `${finalSlug}-${Date.now().toString().slice(-4)}` : finalSlug;

    const newPost = await prisma.post.create({
      data: {
        title: title.trim(),
        slug: uniqueSlug,
        excerpt: excerpt?.trim() || title.trim(),
        content,
        featuredImage: featuredImage || "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1200&q=80",
        featuredImageAlt: featuredImageAlt || "",
        status,
        readingTime,
        authorId,
        reviewedById: reviewedById || null,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        canonicalUrl: canonicalUrl || null,
        sources: sources ? (typeof sources === "string" ? sources : JSON.stringify(sources)) : null,
        isFeatured: Boolean(isFeatured),
        publishedAt: publishedAt ? new Date(publishedAt) : (status === "PUBLISHED" ? new Date() : null),
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
        tags: {
          connect: tagIds.map((id: string) => ({ id })),
        },
      },
    });

    return NextResponse.json({ success: true, post: newPost });
  } catch (err: unknown) {
    console.error("Error creating post:", err);
    return NextResponse.json({ error: "Failed to create post." }, { status: 500 });
  }
}
