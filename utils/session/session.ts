import { User } from "@/utils/db/db";
import { JWTPayload, SignJWT, jwtVerify } from "jose";
import { ObjectId } from "mongodb";
// import { cookies } from "next/headers"; // Passare questa funzione alla chiamata delle funzioni di sessione
import { NextRequest, NextResponse } from "next/server";

const secretKey: string = process.env.SECRET_KEY as string;

const key: Uint8Array = new TextEncoder().encode(secretKey);
const algorithm = "HS256";

const expireTime: number = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

export async function encrypt(payload: any): Promise<string> {
	return await new SignJWT(payload)
		.setProtectedHeader({ alg: algorithm })
		.setIssuedAt()
		.setExpirationTime("1w")
		.sign(key);
}

export async function decrypt(input: string): Promise<JWTPayload> {
	const { payload } = await jwtVerify(input, key, {
		algorithms: [algorithm]
	});
	return payload;
}

export async function login(
	_id: ObjectId,
	username: string,
	password: string,
	res: NextResponse | any
) {
	const user: Partial<User> = {
		_id: _id,
		username: username,
		password: password
	};

	// Creazione della sessione
	const expires = new Date(Date.now() + expireTime);
	const session = await encrypt({ user, expires });

	// Salvataggio del cookie di sessione
	res.set("session", session, { expires: expires, httpOnly: true });
}

export async function logout(res: NextResponse | any) {
	// Distruzione del cookie di sessione
	res.set("session", "", { expires: new Date(0) });
}

export async function getSession(res: NextResponse | any) {
	const session = res.get("session")?.value;
	if (!session) return null;
	return await decrypt(session);
}

export async function isValidSession(
	res: NextResponse | any
): Promise<boolean> {
	const session = await getSession(res);
	if (session === null) return false;
	if (session.exp === undefined) return false;
	if (session.exp < Date.now() / 1000) return false;
	return true;
}

export async function updateSession(request: NextRequest) {
	const session: string | undefined = request.cookies.get("session")?.value;
	if (!session) return null;

	const newDate: Date = new Date(Date.now() + expireTime);

	// expires è il campo che indica la scadenza della sessione per il lato client (Non è quello contenuto nel payload)
	const parsed: JWTPayload = await decrypt(session);
	parsed.expires = newDate;

	// Creazione del nuovo cookie di sessione
	const newSession = await encrypt(parsed);

	// Preparazione della risposta
	const res = NextResponse.next();
	res.cookies.set("session", newSession, {
		expires: newDate,
		httpOnly: true
	});
	return res;
}
