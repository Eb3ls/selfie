import React, { useEffect, useRef, useState } from "react";
import { Button, Form } from "react-bootstrap";
import { FaMinus, FaPlus } from "react-icons/fa6";

interface SettingsProps {
	name: string;
	maxValue: number;
	getter: number;
	setter: React.Dispatch<React.SetStateAction<number>>;
}

export function Setting({ name, maxValue, getter, setter }: SettingsProps) {
	const inputRef = useRef<HTMLInputElement | null>(null);

	// Teniamo il valore come stringa per permettere all'utente di inserire valori non numerici (quando cancella tutto)
	const [localValue, setLocalValue] = useState(getter.toString() || "1");

	// Aggiorna il valore locale quando il valore di getter cambia
	useEffect(() => {
		setLocalValue(getter.toString());
	}, [getter]);

	function changeValue(change: number) {
		const newValue = Math.max(1, Math.min(maxValue, getter + change));
		setter(newValue);
		setLocalValue(newValue.toString());
	}

	function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
		setLocalValue(e.target.value);
	}

	// Quando l'utente preme invio o clicca fuori dall'input, aggiorna il valore
	function handleInputBlur() {
		let parsed = parseInt(localValue);
		if (isNaN(parsed)) {
			parsed = 1;
		}

		if (parsed < 1) {
			parsed = 1;
		} else if (parsed > maxValue) {
			parsed = maxValue;
		}

		setter(parsed);
		setLocalValue(parsed.toString());
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
					max={maxValue}
					value={localValue}
					onChange={handleInputChange}
					onKeyDown={(e) => {
						if (e.key === "Enter") {
							handleInputBlur();
						}
					}}
					onBlur={handleInputBlur}
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
