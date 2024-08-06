import { NextRequest, NextResponse } from "next/server";
import { isValidSession, updateSession } from "@/session_utils/session";

async function api_route_handler(request: NextRequest): Promise<boolean> {
	let path: string = request.nextUrl.pathname;
	path = path.replace("/api", "");
	if (path.startsWith("/signup") || path.startsWith("/signin")) {
		return true;
	}
	const jwt_status: boolean = await isValidSession(request.cookies);
	return jwt_status;
}

export async function middleware(request: NextRequest) {
	const path: string = request.nextUrl.pathname;
	console.warn("Qualuno ha richiesto la risorsa: " + path);

	let outcome: boolean = true;

	if (path.startsWith("/api")) {
		outcome = await api_route_handler(request);
	}

	if (path.startsWith("/calendar")) {
		outcome = await isValidSession(request.cookies);
	}

	if (outcome) {
		console.warn("Controllo riuscito. Passaggio alla risorsa richiesta");
		return await updateSession(request);
	} else {
		// Redirezione alla pagina di login
		console.warn("Controllo fallito, redirezione alla pagina di login");
		return NextResponse.redirect(new URL("/login", request.url).toString());
	}
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!_next/static|_next/image|favicon.ico).*)",
	],
};
