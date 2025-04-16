// Vogliamo realizzare un piccolo wrapper per le fetch alle API.
// Questo wrapper prende in input una promessa di una fetch e restituisce una versione semplificata del tipo standard Response.
// In caso di lancio di eccezione da parte della fetch, restituiamo un oggetto in questa versione semplificata, indicando che c'è stato un errore con status 800 e un messaggio di errore sconosciuto.

type SuccessResponse<T> = {
	headers: Headers;
	ok: true;
	redirected: boolean;
	status: number;
	statusText: string;
	type: ResponseType;
	url: string;
	body: T;
};

type FailureResponse<T> = {
	headers: Headers;
	ok: false;
	redirected: boolean;
	status: number;
	statusText: string;
	type: ResponseType;
	url: string;
	body: T | null;
};

export type SimplifiedResponse<S, E> = SuccessResponse<S> | FailureResponse<E>;

type StandardErrorResponse = {
	message: string;
};

export async function safeFetch<S = any, E = StandardErrorResponse>(
	fetchPromise: Promise<Response>
): Promise<SimplifiedResponse<S, E>> {
	try {
		const response = await fetchPromise;

		const body = await response.json();

		return {
			headers: response.headers,
			ok: response.ok,
			redirected: response.redirected,
			status: response.status,
			statusText: response.statusText,
			type: response.type,
			url: response.url,
			body: body
		};
	} catch {
		return {
			headers: new Headers(),
			ok: false,
			redirected: false,
			status: 800,
			statusText: "Unknown error",
			type: "default",
			url: "",
			body: null
		};
	}
}

export async function generalFetcher<T = any>(url: string): Promise<T> {
	const response = await safeFetch(fetch(url));

	if (!response.ok) {
		throw new Error(response.body?.message || "Unknown error");
	}

	return response.body;
}
