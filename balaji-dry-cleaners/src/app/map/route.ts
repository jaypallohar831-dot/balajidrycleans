import { NextResponse } from "next/server";
import { siteConfig } from "@/config/site";

export function GET() {
  return NextResponse.redirect(siteConfig.address.mapsUrl, { status: 307 });
}
