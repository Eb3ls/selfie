"use client";

import "@/app/calendar/Modal.css";
import { divideResourcesFromUserList } from "@/app/calendar/calendarUtils/calendarFetch";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { StringEvent } from "@/utils/db/db";
import moment from "moment";
import React from "react";
import {
	getTextFromStatus,
	getTextFromTriggerList
} from "../calendarUtils/calendarUX";

type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

export function ViewEventModal({
	event,
	show,
	setShow
}: {
	event: StringEventFrontend;
	show: boolean;
	setShow: (show: boolean) => void;
}) {
	const { users, resources } = divideResourcesFromUserList(
		event.usernameList
	);

	function getViewContent() {
		function generateConversionProps(
			text: string,
			dateToConvert: string | undefined,
			regularTimezone: string
		) {
			if (!dateToConvert) return;
			if (dateToConvert === "") return;
			if (regularTimezone === "") return;

			return (
				<p className="text-muted m-0 p-0">
					{text}:{" "}
					{moment(dateToConvert)
						.tz(regularTimezone)
						.format("YYYY-MM-DD HH:mm")}
				</p>
			);
		}

		return (
			<>
				<StandardViewField title="Titolo" value={event.summary} />
				<StandardViewField
					title="Descrizione"
					value={event.description || "-"}
				/>
				<StandardViewField
					title="Stato"
					value={getTextFromStatus(event.status)}
				/>
				<StandardViewField
					title="Inizio"
					value={moment(event.dtStart).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Fine"
					value={moment(event.dtEnd).format("DD/MM/YYYY HH:mm")}
				/>
				<StandardViewField
					title="Categorie"
					value={event.categories || "-"}
				/>
				<StandardViewField
					title="Fuso orario"
					value={
						<>
							{event.geo || "-"}
							{event.geo &&
								generateConversionProps(
									"Inizio",
									event.dtStart,
									event.geo
								)}
							{event.geo &&
								generateConversionProps(
									"Fine",
									event.dtEnd,
									event.geo
								)}
						</>
					}
				/>
				<StandardViewField
					title="Partecipanti"
					value={users.join(", ") || "-"}
				/>
				<StandardViewField
					title="Risorse"
					value={
						resources
							.map((resource) => resource.slice(6))
							.join(", ") || "-"
					}
				/>
				<StandardViewField
					title="Promemoria"
					value={getTextFromTriggerList(event.alarms)}
				/>
			</>
		);
	}

	function getMainView() {
		let title = "Dettagli Evento (Risorsa)";

		return {
			title,
			handleClose: () => setShow(false),
			renderChildren: () => {
				return getViewContent();
			}
		};
	}

	return (
		<StandardToggleModal
			show={show}
			mainView={getMainView()}
			singleViewsMap={null}
		/>
	);
}
