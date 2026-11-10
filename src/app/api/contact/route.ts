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

    const cleanName = typeof name === "string" ? name.trim() : "";
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanSubject = typeof subject === "string" ? subject.trim() : "";
    const cleanMessage = typeof message === "string" ? message.trim() : "";

    if (!cleanName || !cleanEmail || !cleanSubject || !cleanMessage) {
      return NextResponse.json(
        { error: "All fields are required." },
        { status: 400 }
      );
    }

    const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;
    if (!EMAIL_REGEX.test(cleanEmail) || cleanEmail.length > 120) {
      return NextResponse.json(
        { error: "Please enter a valid email address (max 120 characters)." },
        { status: 400 }
      );
    }

    if (cleanName.length > 100) {
      return NextResponse.json({ error: "Name must not exceed 100 characters." }, { status: 400 });
    }
    if (cleanSubject.length > 150) {
      return NextResponse.json({ error: "Subject must not exceed 150 characters." }, { status: 400 });
    }
    if (cleanMessage.length < 10 || cleanMessage.length > 3000) {
      return NextResponse.json({ error: "Message must be between 10 and 3,000 characters." }, { status: 400 });
    }

    const savedMessage = await prisma.contactMessage.create({
      data: {
        name: cleanName,
        email: cleanEmail,
        subject: cleanSubject,
        message: cleanMessage,
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
