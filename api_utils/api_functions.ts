import { NextResponse } from "next/server";

export async function parseJSONInput(
	request: Request
): Promise<Object | undefined> {
	try {
		return await request.json();
	} catch (e) {
		return undefined;
	}
}

export function isTemplateValid(obj: Object, template: Object): boolean {
	const keys1 = Object.keys(obj).sort();
	const keys2 = Object.keys(template).sort();

	if (keys1.length !== keys2.length) {
		return false;
	}

	for (let i = 0; i < keys1.length; i++) {
		if (keys1[i] !== keys2[i] || typeof keys1[i] !== typeof keys2[i]) {
			return false;
		}
	}

	return true;
}

export function generateMessageResponse(payload: string, status: number) {
	return new NextResponse(JSON.stringify({ message: payload }), {
		status: status,
	});
}

export function generateObjectResponse(payload: Object, status: number) {
	return new NextResponse(JSON.stringify(payload), {
		status: status,
	});
}
