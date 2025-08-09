import { Response } from "express";

export const COOKIE_NAME = process.env.COOKIE_NAME || "token";

type CookieOptions = {
  maxAge?: number;
};

export const setAuthCookie = (res: Response, token: string, opts?: CookieOptions) => {
  const maxAge = opts?.maxAge ?? 7 * 24 * 60 * 60 * 1000; // 7 days default

  const isProd = process.env.NODE_ENV === "production";

  res.cookie(process.env.COOKIE_NAME || "token", token, {
    path: "/",
    maxAge,
    httpOnly: true,
    signed: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};

export const clearAuthCookie = (res: Response) => {
  const isProd = process.env.NODE_ENV === "production";
  res.clearCookie(process.env.COOKIE_NAME || "token", {
    path: "/",
    httpOnly: true,
    signed: true,
    secure: isProd,
    sameSite: isProd ? "none" : "lax",
  });
};
