import { RegisterForm } from "@/app/components/RegisterForm";

export default async function Register() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<RegisterForm />
		</main>
	);
}
