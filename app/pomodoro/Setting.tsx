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
		<div className="d-flex flex-column gap-2 mt-2 container-sm">
			<h5 className="text-primary mb-1 text-center">{name}</h5>
			<div className="d-flex align-items-center bg-light shadow-sm rounded-4 p-3 bg-white small-border">
				<Button
					variant="primary"
					className="rounded-circle d-flex align-items-center justify-content-center p-2"
					onClick={() => changeValue(-1)}
					style={{ width: "40px", height: "40px" }}
				>
					<FaMinus size={16} />
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
					ref={inputRef}
					className="text-center border-0 bg-transparent fs-4 fw-bold flex-grow-1"
					style={{
						width: "80px",
						WebkitAppearance: "none",
						MozAppearance: "textfield"
					}}
				/>
				<Button
					variant="primary"
					className="rounded-circle d-flex align-items-center justify-content-center p-2"
					onClick={() => changeValue(1)}
					style={{ width: "40px", height: "40px" }}
				>
					<FaPlus size={16} />
				</Button>
			</div>
		</div>
	);
}
