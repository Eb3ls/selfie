import {
	AT_THE_TIME,
	ONE_DAY_BEFORE,
	ONE_HOUR_BEFORE,
	StringAlarm,
	TEN_MINUTES_BEFORE,
	Trigger
} from "@/utils/db/models/Alarm";
import { Form } from "react-bootstrap";

interface AlarmSelectorProps {
	alarms: StringAlarm[];
	onChange: (alarms: StringAlarm[]) => void;
}

export function AlarmSelector({ alarms, onChange }: AlarmSelectorProps) {
	const ALARM_OPTIONS = [
		{ value: ONE_DAY_BEFORE, label: "1 giorno prima" },
		{ value: ONE_HOUR_BEFORE, label: "1 ora prima" },
		{ value: TEN_MINUTES_BEFORE, label: "10 minuti prima" },
		{ value: AT_THE_TIME, label: "Al momento dell'evento" }
	] as { value: Trigger; label: string }[];

	const handleAlarmChange = (trigger: Trigger, checked: boolean) => {
		if (checked) {
			onChange([...alarms, { trigger }]);
		} else {
			onChange(alarms.filter((alarm) => alarm.trigger !== trigger));
		}
	};

	return (
		<Form.Group className="mb-3">
			<Form.Label>Notifiche</Form.Label>
			{ALARM_OPTIONS.map((option) => (
				<Form.Check
					key={option.value}
					type="checkbox"
					label={option.label}
					checked={alarms.some(
						(alarm) => alarm.trigger === option.value
					)}
					onChange={(e) =>
						handleAlarmChange(option.value, e.target.checked)
					}
				/>
			))}
		</Form.Group>
	);
}
