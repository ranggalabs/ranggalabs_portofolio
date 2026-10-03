import { NextResponse } from "next/server";
import { apiResponse } from "@/lib/api-response";

export async function POST() {
  const response = apiResponse.success({ loggedOut: true });
  response.cookies.delete("admin_session");
  return response;
}
