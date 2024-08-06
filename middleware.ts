import { NextRequest } from "next/server";
import { updateSession } from "@/session_utils/session";

export async function middleware(request: NextRequest) {
	return await updateSession(request);
}
