"use client";

import { StandardModal } from "@/app/components/StandardModal";
import React, { useState } from "react";
import { FaTrash } from "react-icons/fa6";

export function DeleteNoteModal({ children, handleDelete }: any) {
	const [show, setShow] = useState(false);

	const handleClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		setShow(true);
	};

	return (
		<div
			onClick={(e: any) => {
				e.stopPropagation();
			}}
		>
			{/* Bottone per aprire il modal */}
			<span onClick={handleClick} style={{ cursor: "pointer" }}>
				{children}
			</span>

			<StandardModal
				title="Elimina nota"
				titleIcon={
					<FaTrash
						className="text-danger d-flex justify-content-center"
						size={20}
					/>
				}
				saveBtnText="Cancella"
				show={show}
				handleClose={() => {
					setShow(false);
				}}
				handleSubmit={handleDelete}
			>
				<div>Sei sicuro di voler eliminare questa nota?</div>
			</StandardModal>
		</div>
	);
}
