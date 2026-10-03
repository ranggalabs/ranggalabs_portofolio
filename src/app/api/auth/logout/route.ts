import { apiResponse } from "@/lib/api-response";
import { SESSION_COOKIE_NAME } from "@/lib/session";

export async function POST() {
  const response = apiResponse.success({ loggedOut: true });
  response.cookies.set(SESSION_COOKIE_NAME, "", {
    path: "/",
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  return response;
}
