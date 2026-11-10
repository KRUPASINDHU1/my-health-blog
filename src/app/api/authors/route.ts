import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET() {
  try {
    const authors = await prisma.author.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { posts: true, reviewedPosts: true } },
      },
    });
    return NextResponse.json({ authors });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch authors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { name, credentials, title, bio, avatar, email, socialTwitter, socialLinkedin } = await req.json();

    if (!name || !credentials || !bio) {
      return NextResponse.json({ error: "Name, credentials, and bio are required" }, { status: 400 });
    }

    const slug = slugify(name);
    const author = await prisma.author.create({
      data: {
        name: name.trim(),
        slug,
        credentials: credentials.trim(),
        title: title?.trim() || "Medical Contributor",
        bio: bio.trim(),
        avatar: avatar || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
        email: email?.trim() || null,
        socialTwitter: socialTwitter || null,
        socialLinkedin: socialLinkedin || null,
      },
    });

    return NextResponse.json({ success: true, author });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to create author" }, { status: 500 });
  }
}
