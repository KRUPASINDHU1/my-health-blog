import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const { name, credentials, title, bio, avatar, email, socialTwitter, socialLinkedin } = body;

    const author = await prisma.author.update({
      where: { id },
      data: {
        ...(name && { name: name.trim(), slug: slugify(name) }),
        ...(credentials && { credentials: credentials.trim() }),
        ...(title !== undefined && { title: title.trim() }),
        ...(bio !== undefined && { bio: bio.trim() }),
        ...(avatar && { avatar }),
        email: email !== undefined ? (email.trim() || null) : undefined,
        socialTwitter: socialTwitter !== undefined ? (socialTwitter.trim() || null) : undefined,
        socialLinkedin: socialLinkedin !== undefined ? (socialLinkedin.trim() || null) : undefined,
      },
    });

    return NextResponse.json({ success: true, author });
  } catch (err: unknown) {
    console.error("Error updating author:", err);
    return NextResponse.json({ error: "Failed to update author" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    // 1. Unlink from reviewed posts so foreign key doesn't block deletion
    await prisma.post.updateMany({
      where: { reviewedById: id },
      data: { reviewedById: null },
    });

    // 2. Check if author has authored posts
    const authoredCount = await prisma.post.count({ where: { authorId: id } });
    if (authoredCount > 0) {
      // Find an alternate author to reassign posts to
      const alternateAuthor = await prisma.author.findFirst({
        where: { id: { not: id } },
        orderBy: { createdAt: "asc" },
      });

      if (alternateAuthor) {
        await prisma.post.updateMany({
          where: { authorId: id },
          data: { authorId: alternateAuthor.id },
        });
      } else {
        return NextResponse.json(
          { error: "Cannot delete the only author when posts exist. Please create another author first or delete the posts." },
          { status: 400 }
        );
      }
    }

    // 3. Delete the author safely
    await prisma.author.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    console.error("Error deleting author:", err);
    return NextResponse.json({ error: "Failed to delete author" }, { status: 500 });
  }
}
