import React from "react";

interface StandardInputProps {
	type: string;
	name: string;
	title: string;
	placeholder?: string;
	onChange: React.ChangeEventHandler<
		HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
	>;
	value: string | number;
	min?: number | string;
	max?: number | string;
	optionMap?: { [key: string]: string };
	isRequired?: boolean;
}

export function StandardInput({
	type,
	name,
	title,
	placeholder,
	value,
	onChange,
	min,
	max,
	optionMap = {},
	isRequired = true
}: StandardInputProps) {
	if (type === "textarea") {
		return (
			<div className="mb-3">
				<label htmlFor={name} className="form-label fw-bold">
					{title}
				</label>
				<textarea
					name={name}
					autoComplete="off"
					id={name}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					required={isRequired}
					rows={5}
					className="form-control"
				/>
			</div>
		);
	} else if (type === "select") {
		return (
			<div className="mb-3">
				<label htmlFor={name} className="form-label fw-bold">
					{title}
				</label>

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
			</div>
		);
	} else {
		return (
			<div className="mb-3">
				<label htmlFor={name} className="form-label fw-bold">
					{title}
				</label>
				<input
					type={type}
					autoComplete="off"
					name={name}
					id={name}
					placeholder={placeholder}
					value={value}
					onChange={onChange}
					required={isRequired}
					className="form-control"
					min={min}
					max={max}
					minLength={typeof min === "number" ? min : undefined}
					maxLength={typeof max === "number" ? max : undefined}
				/>
			</div>
		);
	}
}
