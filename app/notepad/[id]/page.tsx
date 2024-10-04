"use client";

import React from "react";

interface NoteProps {
	params: {
		id: string;
	};
}

const Note: React.FC<NoteProps> = ({ params }) => {
	const { id } = params; // Ottieni l'id dai parametri dinamici

	if (!id) {
		return <p>Loading...</p>;
	}

	return (
		<div>
			<h1>{id}</h1>
		</div>
	);
};

export default Note;
