import React from "react";
import { toast } from "react-toastify";

function ConfirmToast({ onConfirm, onCancel, summary }: any) {
	return (
		<div>
			<p>Sei sicuro di voler eliminare la nota &quot;{summary}&quot;?</p>
			<div
				style={{
					display: "flex",
					justifyContent: "flex-end",
					gap: "0.5rem"
				}}
			>
				<button
					onClick={onCancel}
					style={{
						backgroundColor: "#ccc",
						border: "none",
						padding: "0.5rem 1rem"
					}}
				>
					Annulla
				</button>
				<button
					onClick={onConfirm}
					style={{
						backgroundColor: "#f37b85",
						border: "none",
						color: "white",
						padding: "0.5rem 1rem"
					}}
				>
					Conferma
				</button>
			</div>
		</div>
	);
}

// Funzione per mostrare il toast di conferma
export function showConfirmToast(onConfirm: any, summary: string) {
	const toastId = toast(
		<ConfirmToast
			onConfirm={() => {
				toast.dismiss(toastId);
				onConfirm();
			}}
			onCancel={() => {
				toast.dismiss(toastId);
			}}
			summary={summary}
		/>,
		{
			autoClose: false,
			closeOnClick: false,
			draggable: false
		}
	);
}
