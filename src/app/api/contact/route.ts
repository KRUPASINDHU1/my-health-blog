import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "anonymous";
    const limiter = rateLimit(`contact_${ip}`, 5, 10 * 60 * 1000); // Max 5 messages per 10 mins

    if (!limiter.success) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few minutes before submitting another inquiry." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { name, email, subject, message, honeypot } = body;

    // Honeypot spam trap: if bot filled this out, silently accept without creating genuine notification
    if (honeypot && honeypot.trim().length > 0) {
      await prisma.contactMessage.create({
        data: {
          name: name || "Bot",
          email: email || "bot@spam.com",
          subject: subject || "Spam",
          message: message || "Spam payload",
          isSpam: true,
          isRead: true,
        },
      });
      return NextResponse.json({ success: true, message: "Message received." });
    }

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    if (!email.includes("@") || !email.includes(".")) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        subject: subject.trim(),
        message: message.trim(),
        isSpam: false,
        isRead: false,
      },
    });

    return NextResponse.json({ success: true, id: savedMessage.id });
  } catch (err: unknown) {
    console.error("Error submitting contact form:", err);
    return NextResponse.json(
      { error: "Failed to submit message. Internal server error." },
      { status: 500 }
    );
  }
}
