import BasicForm from "../components/BasicForm";

export default async function Register() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<h1>Selfie!</h1>
			<BasicForm />
		</main>
	);
}
