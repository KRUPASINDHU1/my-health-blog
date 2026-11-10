import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const filterSpam = searchParams.get("spam") === "true";

    const messages = await prisma.contactMessage.findMany({
      where: { isSpam: filterSpam },
      orderBy: { createdAt: "desc" },
    });

    const unreadCount = await prisma.contactMessage.count({
      where: { isRead: false, isSpam: false },
    });

    return NextResponse.json({ messages, unreadCount });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}
