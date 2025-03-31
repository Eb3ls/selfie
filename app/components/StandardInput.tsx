import React from "react";

interface StandardInputProps {
	type?: string;
	name: string;
	title: string;
	placeholder?: string;
	onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	value: string | number;
	optionMap?: { [key: string]: string };
	isRequired?: boolean;
}

export default function StandardInput({
	type,
	name,
	title,
	placeholder,
	onChange,
	value,
	optionMap = {},
	isRequired = true
}: StandardInputProps) {
	return (
		<div className="mb-3">
			<label htmlFor={name} className="form-label fw-bold">
				{title}
			</label>
			{Object.keys(optionMap).length === 0 ? (
				<input
					type={type}
					name={name}
					id={name}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					required={isRequired}
					className="form-control"
				/>
			) : (
				<select
					name={name}
					id={name}
					onChange={onChange}
					value={value}
					className="form-select"
					required={isRequired}
				>
					{Object.entries(optionMap).map(([value, title]) => (
						<option key={value} value={value}>
							{title}
						</option>
					))}
				</select>
			)}
		</div>
	);
}
