import React, { useRef } from "react";
import { Button, Form, InputGroup } from "react-bootstrap";
import { FaAnglesDown, FaAnglesUp } from "react-icons/fa6";

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
		const val = parseInt(e.target.value);
		if (isNaN(val)) {
			setter(1);
		} else {
			setter(val);
		}
		inputRef.current?.focus();
	}

	return (
		<div className="d-flex flex-column m-3 align-items-center justify-content-center">
			<Button onClick={() => changeValue(1)}>
				<FaAnglesUp className="icon"></FaAnglesUp>
			</Button>
			<Form.Label htmlFor="study-time" className="mt-2">
				{name}
			</Form.Label>
			<InputGroup className="mb-2">
				<Form.Control
					id="study-time"
					type="number"
					min={1}
					value={getter}
					onChange={handleInputChange}
					className="text-center"
					ref={inputRef}
				/>
			</InputGroup>
			<Button onClick={() => changeValue(-1)}>
				<FaAnglesDown className="icon"></FaAnglesDown>
			</Button>
		</div>
	);
}
