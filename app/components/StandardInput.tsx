import React from "react";

interface StandardInputProps {
	type: string;
	name: string;
	title: string;
	placeholder: string;
	onChange: React.ChangeEventHandler<HTMLInputElement | HTMLSelectElement>;
	value: string | number;
	optionArray?: string[];
	isRequired?: boolean;
}

export default function StandardInput({
	type,
	name,
	title,
	placeholder,
	onChange,
	value,
	optionArray = [],
	isRequired = true
}: StandardInputProps) {
	return (
		<div className="mb-3">
			<label htmlFor={name} className="form-label fw-bold">
				{title}
			</label>
			{optionArray.length === 0 ? (
				<input
					type={type}
					name={name}
					id={name}
					placeholder={placeholder}
					onChange={onChange}
					value={value}
					className="form-control"
					required={isRequired}
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
					{optionArray.map((option) => (
						<option key={option} value={option}>
							{option}
						</option>
					))}
				</select>
			)}
		</div>
	);
}
