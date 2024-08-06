import Link from "next/link";

export default function Home() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<h1>Selfie!</h1>
			<Link href="/register">Premi qui effettuare la Registrazione</Link>
			<Link href="/login">Premi qui per effetturare il Login</Link>
		</main>
	);
}
