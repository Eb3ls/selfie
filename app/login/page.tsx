import { Collection } from "mongodb";
import { getCollection } from "@/db_utils/db_functions";
import { User } from "@/db_utils/models/User";

export default async function Login() {
	const client: Collection<User> = await getCollection<User>("users");
	const result = await client.find({}).toArray();
	console.log(result);
	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<h1>Selfie!</h1>
			<ul>
				{result.map((user) => (
					<li key={user._id.toString()}>
						{user._id.toString()} - {user.username}
					</li>
				))}
			</ul>
		</main>
	);
}
