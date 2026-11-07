import { NextResponse } from "next/server";
import { getWhatsAppLink } from "@/config/site";

export function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get("text") || undefined;
  const redirectUrl = getWhatsAppLink(text);

  return NextResponse.redirect(redirectUrl, { status: 307 });
}
