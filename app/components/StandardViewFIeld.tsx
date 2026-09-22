import type { JSX } from "react";

interface StandardViewFieldProps {
	title: string;
	value: string | number | JSX.Element;
}

export function StandardViewField({ title, value }: StandardViewFieldProps) {
	return (
		<div className="mb-3">
			<label className="form-label fw-bold">{title}</label>
			<div
				className="p-2 bg-light rounded overflow-y-auto"
				style={{ maxHeight: 300 }}
			>
				{value}
			</div>
		</div>
	);
}
