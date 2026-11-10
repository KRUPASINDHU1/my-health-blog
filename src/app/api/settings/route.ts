import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getSiteSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized. Admin role required." }, { status: 403 });
    }

    const body = await req.json();

    const allowedKeys = [
      "siteName",
      "tagline",
      "description",
      "logoUrl",
      "footerText",
      "contactEmail",
      "contactAddress",
      "contactPhone",
      "googleAnalyticsId",
      "adsensePublisherId",
      "adsTxtContent",
      "adsEnabled",
      "adSlotsConfig",
      "socialLinks",
    ];

    for (const key of allowedKeys) {
      if (body[key] !== undefined) {
        let val = body[key];
        if (typeof val === "object") {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }

        await prisma.siteSetting.upsert({
          where: { key },
          update: { value: val },
          create: { key, value: val },
        });
      }
    }

    const updated = await getSiteSettings();
    return NextResponse.json({ success: true, settings: updated });
  } catch (err: unknown) {
    console.error("Settings update error:", err);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
