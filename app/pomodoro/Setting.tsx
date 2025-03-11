import React, { useRef } from "react";
import { Button, Form } from "react-bootstrap";
import { FaMinus, FaPlus } from "react-icons/fa6";

interface SettingsProps {
	name: string;
	getter: number;
	setter: React.Dispatch<React.SetStateAction<number>>;
}

export function Setting({ name, getter, setter }: SettingsProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	function changeValue(value: number) {
		setter(Math.max(1, getter + value));
		return;
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		if (e.target.value === "") {
			setter(1);
		} else {
			const val = parseInt(e.target.value);
			if (isNaN(val)) {
				setter(1);
			} else {
				setter(val);
			}
		}
		inputRef.current?.focus();
	}

	return (
		<div className="d-flex flex-column align-items-center p-2 container-sm">
			<Form.Label className="mb-2">{name}</Form.Label>
			<div className="d-flex align-items-center bg-primary rounded-pill p-3 flex-grow-1 w-100 gap-2">
				<Button
					className="btn-sm bg-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
					onClick={() => changeValue(-1)}
					style={{ width: "32px", height: "32px" }}
				>
					<FaMinus className="text-primary" />
				</Button>
				<Form.Control
					type="number"
					min={1}
					value={getter}
					onChange={handleInputChange}
					className="text-center mx-2 rounded-pill flex-grow-1"
					style={{
						WebkitAppearance: "none",
						MozAppearance: "textfield"
					}}
					ref={inputRef}
				/>
				<Button
					className="btn-sm bg-white rounded-circle d-flex align-items-center justify-content-center flex-shrink-0"
					onClick={() => changeValue(1)}
					style={{ width: "32px", height: "32px" }}
				>
					<FaPlus className="text-primary" />
				</Button>
			</div>
		</div>
	);
}
