import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME } from "@/lib/auth";
import { ok } from "@/lib/response";

export async function POST() {
  const res = ok({ message: "Logout ho gaya hai." }, 200);

  res.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
