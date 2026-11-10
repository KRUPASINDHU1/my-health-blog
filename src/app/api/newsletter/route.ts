import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = rateLimit(`newsletter_${ip}`, 10, 15 * 60 * 1000);

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many subscription attempts. Please try again later." },
        { status: 429 }
      );
    }

    const { email, source } = await req.json();

    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!cleanEmail || !EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 120) {
      return NextResponse.json(
        { error: "A valid email address is required (max 120 characters)." },
        { status: 400 }
      );
    }

    // Upsert subscriber
    const subscriber = await prisma.subscriber.upsert({
      where: { email: cleanEmail },
      update: { status: "ACTIVE", source: source || "website" },
      create: {
        email: cleanEmail,
        status: "ACTIVE",
        source: source || "website",
      },
    });

    return NextResponse.json({ success: true, id: subscriber.id });
  } catch (err: unknown) {
    console.error("Error in newsletter subscription:", err);
    return NextResponse.json(
      { error: "Subscription processing error. Please try again." },
      { status: 500 }
    );
  }
}
