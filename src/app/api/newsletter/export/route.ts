import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const subscribers = await prisma.subscriber.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Generate CSV content
    const header = "ID,Email,Status,Source,SubscribedAt\n";
    const rows = subscribers
      .map(
        (s) =>
          `"${s.id}","${s.email}","${s.status}","${s.source}","${s.createdAt.toISOString()}"`
      )
      .join("\n");

    const csvContent = header + rows;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
      },
    });
  } catch (err: unknown) {
    return NextResponse.json({ error: "Failed to export subscribers" }, { status: 500 });
  }
}
