import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signToken, setSessionCookie } from "@/lib/auth";

export async function GET() {
  const userCount = await prisma.user.count();
  return NextResponse.json({ setupNeeded: userCount === 0 });
}

export async function POST(req: NextRequest) {
  try {
    const userCount = await prisma.user.count();
    if (userCount > 0) {
      return NextResponse.json(
        { error: "Setup has already been completed. First-run registration is locked." },
        { status: 403 }
      );
    }

    const { name, email, password } = await req.json();

    if (!name || !email || !password || password.length < 8) {
      return NextResponse.json(
        { error: "All fields are required. Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const ownerUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        passwordHash,
        role: "ADMIN",
        bio: "Owner & Chief Medical Editor",
      },
    });

    // Also auto-create author record if none exists so they can author posts immediately
    const authorSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await prisma.author.upsert({
      where: { slug: authorSlug },
      update: {},
      create: {
        name: name.trim(),
        slug: authorSlug,
        credentials: "MD / Editor-in-Chief",
        title: "Medical Director & Chief Editor",
        bio: `${name} is the founder and editor-in-chief of this publication.`,
        avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=400&q=80",
        email: email.trim().toLowerCase(),
      },
    });

    const token = await signToken({
      userId: ownerUser.id,
      email: ownerUser.email,
      name: ownerUser.name,
      role: ownerUser.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: ownerUser.id,
        name: ownerUser.name,
        email: ownerUser.email,
        role: ownerUser.role,
      },
    });
  } catch (err: unknown) {
    console.error("Setup error:", err);
    return NextResponse.json(
      { error: "First-run setup failed." },
      { status: 500 }
    );
  }
}
