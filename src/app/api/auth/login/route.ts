import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, hashPassword, signToken, setSessionCookie } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = rateLimit(`login_${ip}`, 8, 15 * 60 * 1000); // 8 attempts per 15 min

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many login attempts. For security reasons, please wait 15 minutes." },
        { status: 429 }
      );
    }

    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();
    const envAdminEmail = (process.env.ADMIN_EMAIL || "dindakrupasindhu420@gmail.com").trim().toLowerCase();
    const envAdminPassword = process.env.ADMIN_PASSWORD || "Krupa@123#987";

    // Secure environment variable admin authentication & automatic database sync
    if (envAdminEmail && normalizedEmail === envAdminEmail && envAdminPassword && password === envAdminPassword) {
      let adminUser = await prisma.user.findFirst({
        where: {
          OR: [{ email: normalizedEmail }, { role: "ADMIN" }],
        },
      });

      if (!adminUser) {
        const passwordHash = await hashPassword(password);
        adminUser = await prisma.user.create({
          data: {
            name: "Mr. KD",
            email: normalizedEmail,
            passwordHash,
            role: "ADMIN",
            avatar: "/uploads/krupasindhu_dinda_avatar.jpg",
          },
        });
      } else {
        const isMatch = await verifyPassword(password, adminUser.passwordHash);
        if (adminUser.email !== normalizedEmail || !isMatch) {
          const passwordHash = await hashPassword(password);
          adminUser = await prisma.user.update({
            where: { id: adminUser.id },
            data: { email: normalizedEmail, passwordHash },
          });
        }
      }

      const token = await signToken({
        userId: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
      });

      await setSessionCookie(token);

      return NextResponse.json({
        success: true,
        user: {
          id: adminUser.id,
          name: adminUser.name,
          email: adminUser.email,
          role: adminUser.role,
        },
      });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid credentials." },
        { status: 401 }
      );
    }

    // Sign session
    const token = await signToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err: unknown) {
    console.error("Login error:", err);
    return NextResponse.json(
      { error: "Authentication system error." },
      { status: 500 }
    );
  }
}
