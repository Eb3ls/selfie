import { LoginForm } from "@/app/components/LoginForm";

export default async function Login() {
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<LoginForm />
		</main>
	);
}
