import { useEffect, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaTrash, FaUser } from "react-icons/fa";

interface ResourceInvitationComponentProps {
	mainId: string;
	resourceList: string[];
	setResourceList: (resourceList: string[]) => void;
}

export function ResourceInvitationComponent({
	mainId,
	resourceList,
	setResourceList
}: ResourceInvitationComponentProps) {
	const [currentMainId, setCurrentMainId] = useState("");
	const [currentOriginalResources, setCurrentOriginalResources] = useState<
		string[]
	>([]);

	function testRES(num: number) {
		let res = [];
		for (let i = 0; i < num; i++) {
			res.push("RES-" + i);
		}
		return res;
	}

	// Se cambia l'id dell'attività, aggiorna la lista delle risorse che erano già presenti
	useEffect(() => {
		if (currentMainId !== mainId) {
			setCurrentMainId(mainId);
			setCurrentOriginalResources([...resourceList, ...testRES(10)]);
		}
	}, [mainId, currentMainId, resourceList]);

	// Troviamo le risorse in resourceList che erano presenti anche in currentOriginalResources
	// E troviamo le risorse in currentOriginalResources che non sono presenti in resourceList
	const oldResources = currentOriginalResources.filter((resource) =>
		resourceList.includes(resource)
	);
	oldResources.push(...testRES(1));
	const newResources = resourceList.filter(
		(resource) => !currentOriginalResources.includes(resource)
	);
	newResources.push(...testRES(1));

	const [resourceInput, setResourceInput] = useState("");

	// Funzione per aggiungere un invito
	const handleAddResource = () => {
		if (!resourceInput.trim()) {
			return;
		}

		const correctResourceInput = "RES-" + resourceInput.trim();

		// Se la risorsa è già presente, non fare nulla
		if (resourceList.includes(correctResourceInput)) {
			setResourceInput("");
			return;
		}

		setResourceList([...resourceList, correctResourceInput]);
		setResourceInput("");
	};

	// Funzione per rimuovere una risorsa
	const handleRemoveResource = (resourceToRemove: string) => {
		setResourceList(
			resourceList.filter((resource) => resource !== resourceToRemove)
		);
	};

	return (
		<Form.Group className="mb-3">
			<Form.Label className="fw-bold">Risorse</Form.Label>
			<div className="d-flex mb-3">
				<Form.Control
					type="text"
					value={resourceInput}
					onChange={(e) => setResourceInput(e.target.value)}
					placeholder="Inserisci nome utente"
					className="input-field"
				/>
				<Button
					className="ms-2 rounded-3 hover-lift"
					variant="primary"
					onClick={handleAddResource}
					type="button"
				>
					+
				</Button>
			</div>

			{/* Existing Resources Section */}
			{oldResources.length > 0 && (
				<div className="mb-4">
					<h6 className="text-muted mb-3">Risorse già aggiunte</h6>
					<div
						className="list-group shadow-sm"
						style={{ maxHeight: "200px", overflowY: "auto" }}
					>
						{oldResources.map((resource) => (
							<div
								key={resource}
								className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
							>
								<div className="d-flex align-items-center">
									<FaUser className="text-primary me-3" />
									<span className="fw-medium">
										{resource.substring(4)}
									</span>
								</div>
								<Button
									variant="link"
									className="text-danger p-1"
									onClick={() =>
										handleRemoveResource(resource)
									}
								>
									<FaTrash size={14} className="hover-grow" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}

			{/* New Resources Section */}
			{newResources.length > 0 && (
				<div>
					<h6 className="text-muted mb-3">Risorse da aggiungere</h6>
					<div
						className="list-group shadow-sm"
						style={{ maxHeight: "200px", overflowY: "auto" }}
					>
						{newResources.map((resource) => (
							<div
								key={resource}
								className="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
							>
								<div className="d-flex align-items-center">
									<FaUser className="text-primary me-3" />
									<span className="fw-medium">
										{resource.substring(4)}
									</span>
								</div>
								<Button
									variant="link"
									className="text-danger p-1"
									onClick={() =>
										handleRemoveResource(resource)
									}
								>
									<FaTrash size={14} className="hover-grow" />
								</Button>
							</div>
						))}
					</div>
				</div>
			)}
		</Form.Group>
	);
}
