interface StandardViewFieldProps {
	title: string;
	value: string | number;
}

export function StandardViewField({ title, value }: StandardViewFieldProps) {
	return (
		<div className="mb-3">
			<label className="form-label fw-bold">{title}</label>
			<div className="p-2 bg-light rounded">{value}</div>
		</div>
	);
}
