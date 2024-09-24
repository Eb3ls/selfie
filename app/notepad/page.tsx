import Sidebar from "@/app/components/Sidebar";

// Percorso in base alla struttura del progetto

export default function Home() {
	return (
		<div>
			<Sidebar />
			<div className="content">
				<h1>Notepad</h1>
			</div>
		</div>
	);
}
