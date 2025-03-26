import moment from "moment-timezone";
import { useMemo, useState } from "react";
import { Form } from "react-bootstrap";

// Funzione per ottenere il nome del paese
function getCountryName(code: string) {
	return new Intl.DisplayNames(["it"], { type: "region" }).of(code);
}

type TimezoneSuggestion = {
	country: string;
	timezone: string;
};

// Funzione per generare tutte le coppie di countryName e tz
function generateTimezoneOptions() {
	const countryCodes = moment.tz.countries();
	const timezones = [] as TimezoneSuggestion[];

	for (const code of countryCodes) {
		const zones = moment.tz.zonesForCountry(code) || [];

		for (const tz of zones) {
			const country = getCountryName(code);

			if (country) {
				timezones.push({ country: country, timezone: tz });
			}
		}
	}

	return timezones;
}

interface TimezoneSelectorProps {
	regularTimezone: string;
	setRegularTimezone: (timezone: string) => void;
}

export function TimezoneSelector({
	regularTimezone,
	setRegularTimezone
}: TimezoneSelectorProps) {
	const [timezone, setTimezone] = useState(regularTimezone);

	const timezones = useMemo(() => generateTimezoneOptions(), []);

	function isValidTimezone(timezone: string) {
		return timezones.some((tz) => tz.timezone === timezone);
	}

	function onChange(e: React.ChangeEvent<HTMLInputElement>) {
		setTimezone(e.target.value);

		if (isValidTimezone(e.target.value)) {
			setRegularTimezone(e.target.value);
		}
	}

	return (
		<Form.Group className="mb-3">
			<Form.Label>Fuso orario</Form.Label>
			<Form.Control
				type="text"
				list="timezone-list"
				value={timezone}
				onChange={onChange}
				onBlur={() => {
					if (!isValidTimezone(timezone)) {
						setTimezone(regularTimezone);
					}
				}}
				required
			/>
			<datalist id="timezone-list">
				{timezones.map((tz) => (
					<option
						key={`${tz.country}-${tz.timezone}`}
						value={tz.timezone}
					>
						{tz.country} - {tz.timezone}
					</option>
				))}
			</datalist>
		</Form.Group>
	);
}
