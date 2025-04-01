import { Col, Form, Row } from "react-bootstrap";
import { StandardInput } from "./StandardInput";

// Mappe per la conversione dei valori
const WEEKDAY_MAP: { [key: string]: string } = {
	Lunedì: "MO",
	Martedì: "TU",
	Mercoledì: "WE",
	Giovedì: "TH",
	Venerdì: "FR",
	Sabato: "SA",
	Domenica: "SU"
};

const MONTH_MAP: { [key: string]: string } = {
	Gennaio: "1",
	Febbraio: "2",
	Marzo: "3",
	Aprile: "4",
	Maggio: "5",
	Giugno: "6",
	Luglio: "7",
	Agosto: "8",
	Settembre: "9",
	Ottobre: "10",
	Novembre: "11",
	Dicembre: "12"
};

interface StandardRepetitionInputProps {
	recurrenceType: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
	setRecurrenceType: React.Dispatch<
		React.SetStateAction<"DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY">
	>;
	recurrenceEnd: "NEVER" | "UNTIL_EVENT_END" | "COUNT";
	setRecurrenceEnd: React.Dispatch<
		React.SetStateAction<"NEVER" | "UNTIL_EVENT_END" | "COUNT">
	>;
	recurrenceEndDate: string;
	setRecurrenceEndDate: React.Dispatch<React.SetStateAction<string>>;
	recurrenceCount: number;
	setRecurrenceCount: React.Dispatch<React.SetStateAction<number>>;
	weeklyDays: string[];
	setWeeklyDays: React.Dispatch<React.SetStateAction<string[]>>;
	monthlyDays: number[];
	setMonthlyDays: React.Dispatch<React.SetStateAction<number[]>>;
	yearlyMonths: string[];
	setYearlyMonths: React.Dispatch<React.SetStateAction<string[]>>;
}

export function StandardRepetitionInput({
	recurrenceType,
	setRecurrenceType,
	recurrenceEnd,
	setRecurrenceEnd,
	recurrenceEndDate,
	setRecurrenceEndDate,
	recurrenceCount,
	setRecurrenceCount,
	weeklyDays,
	setWeeklyDays,
	monthlyDays,
	setMonthlyDays,
	yearlyMonths,
	setYearlyMonths
}: StandardRepetitionInputProps) {
	const handleRecurrenceTypeChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setRecurrenceType(
			e.target.value as "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY"
		);
	};

	const handleRecurrenceEndChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		setRecurrenceEnd(
			e.target.value as "NEVER" | "UNTIL_EVENT_END" | "COUNT"
		);
	};

	const handleWeeklyDaysChange = (day: string) => {
		const mappedDay = WEEKDAY_MAP[day];
		setWeeklyDays((prev) =>
			prev.includes(mappedDay)
				? prev.filter((d) => d !== mappedDay)
				: [...prev, mappedDay]
		);
	};

	const handleMonthlyDaysChange = (day: number) => {
		setMonthlyDays((prev) =>
			prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
		);
	};

	const handleYearlyMonthsChange = (month: string) => {
		const mappedMonth = MONTH_MAP[month];
		setYearlyMonths((prev) =>
			prev.includes(mappedMonth)
				? prev.filter((m) => m !== mappedMonth)
				: [...prev, mappedMonth]
		);
	};
	return (
		<>
			<StandardInput
				type="select"
				name="recurrenceType"
				title="Tipo di ripetizione"
				onChange={handleRecurrenceTypeChange}
				value={recurrenceType}
				optionMap={{
					DAILY: "Giornaliero",
					WEEKLY: "Settimanale",
					MONTHLY: "Mensile",
					YEARLY: "Annuale"
				}}
			/>

			{recurrenceType === "WEEKLY" && (
				<div className="my-3">
					<Form.Label className="fw-bold">
						Giorni della settimana
					</Form.Label>
					<Row>
						{[
							"Lunedì",
							"Martedì",
							"Mercoledì",
							"Giovedì",
							"Venerdì",
							"Sabato",
							"Domenica"
						].map((day) => (
							<Col key={day} xs={6} sm={4} md={3}>
								<Form.Check
									type="checkbox"
									label={day}
									checked={weeklyDays.includes(
										WEEKDAY_MAP[day]
									)}
									onChange={() => handleWeeklyDaysChange(day)}
								/>
							</Col>
						))}
					</Row>
				</div>
			)}

			{recurrenceType === "MONTHLY" && (
				<div className="my-3">
					<Form.Label className="fw-bold">Giorni del mese</Form.Label>
					<Row>
						{Array.from({ length: 31 }, (_, i) => i + 1).map(
							(day) => (
								<Col key={day} xs={6} sm={4} md={3}>
									<Form.Check
										type="checkbox"
										label={day}
										checked={monthlyDays.includes(day)}
										onChange={() =>
											handleMonthlyDaysChange(day)
										}
									/>
								</Col>
							)
						)}
					</Row>
				</div>
			)}

			{recurrenceType === "YEARLY" && (
				<div className="my-3">
					<Form.Label className="fw-bold">Mesi</Form.Label>
					<Row>
						{[
							"Gennaio",
							"Febbraio",
							"Marzo",
							"Aprile",
							"Maggio",
							"Giugno",
							"Luglio",
							"Agosto",
							"Settembre",
							"Ottobre",
							"Novembre",
							"Dicembre"
						].map((month) => (
							<Col key={month} xs={6} sm={4} md={3}>
								<Form.Check
									type="checkbox"
									label={month}
									checked={yearlyMonths.includes(
										MONTH_MAP[month]
									)}
									onChange={() =>
										handleYearlyMonthsChange(month)
									}
								/>
							</Col>
						))}
					</Row>
				</div>
			)}

			<StandardInput
				type="select"
				name="repetitionEnd"
				title="Fine della ripetizione"
				value={recurrenceEnd}
				onChange={handleRecurrenceEndChange}
				optionMap={{
					NEVER: "Mai",
					UNTIL_EVENT_END: "Fino a data di fine",
					COUNT: "Dopo un numero di occorrenze"
				}}
			/>

			{recurrenceEnd === "UNTIL_EVENT_END" && (
				<StandardInput
					type="date"
					name="recurrenceEndDate"
					title="Fine ricorrenza"
					value={recurrenceEndDate}
					onChange={(e) => setRecurrenceEndDate(e.target.value)}
				/>
			)}

			{recurrenceEnd === "COUNT" && (
				<StandardInput
					type="number"
					name="recurrenceCount"
					title="Numero di occorrenze"
					value={recurrenceCount}
					onChange={(e) =>
						setRecurrenceCount(parseInt(e.target.value))
					}
					min={1}
				/>
			)}
		</>
	);
}
