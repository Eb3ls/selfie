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
		// TODO: da togliere altrimenti non si puó cancellare tutto per scrivere meglio
		if (isNaN(val)) {
			setter(1);
		} else {
			setter(val);
		}
		inputRef.current?.focus();
	}

	return (
		<div className="d-flex flex-md-column m-2 align-items-center justify-content-center">
			<Button
				className="align-self-end align-self-md-center"
				onClick={() => changeValue(1)}
				variant="link"
			>
				<FaAnglesUp className="icon"></FaAnglesUp>
			</Button>
			<div className="d-flex flex-column align-items-center justify-content-center">
				<Form.Label htmlFor="study-time">{name}</Form.Label>
				<InputGroup className="">
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
			</div>
			<Button
				className="align-self-end align-self-md-center"
				onClick={() => changeValue(-1)}
				variant="link"
			>
				<FaAnglesDown className="icon"></FaAnglesDown>
			</Button>
		</div>
	);
}
