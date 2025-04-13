import React from "react";
import { Id, toast } from "react-toastify";

interface ConfirmToastProps {
	onConfirm: () => void;
	onCancel: () => void;
	summary: string;
}

function ConfirmToast({ onConfirm, onCancel, summary }: ConfirmToastProps) {
	return (
		<div className="p-3" style={{ minWidth: "320px", maxWidth: "500px" }}>
			<p className="text-break mb-3">
				Sei sicuro di voler eliminare la nota &quot;{summary}&quot;?
			</p>
			<div className="d-flex justify-content-end gap-2">
				<button
					onClick={onCancel}
					className="btn btn-secondary btn-sm hover-lift"
				>
					Annulla
				</button>
				<button
					onClick={onConfirm}
					className="btn btn-danger btn-sm hover-lift"
				>
					Conferma
				</button>
			</div>
		</div>
	);
}

let currentToastId: Id | null = null;

export function showConfirmToast(onConfirm: () => void, summary: string) {
	const toastId = toast(
		<ConfirmToast
			onConfirm={() => {
				toast.dismiss(toastId);
				currentToastId = null;
				onConfirm();
			}}
			onCancel={() => {
				toast.dismiss(toastId);
				currentToastId = null;
			}}
			summary={summary}
		/>,
		{
			position: "top-center",
			autoClose: 3000,
			hideProgressBar: true,
			closeOnClick: false,
			draggable: false,
			closeButton: true,
			className: "confirm-toast",
			style: { maxWidth: "500px", width: "max-content" }
		}
	);
	// Se c'é un toast attivo lo chiudiamo
	setTimeout(() => {
		if (currentToastId && toast.isActive(currentToastId)) {
			toast.dismiss(currentToastId);
			currentToastId = null;
		}
		currentToastId = toastId;
	}, 200);
}
