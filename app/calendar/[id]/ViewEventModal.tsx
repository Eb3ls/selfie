"use client";

import "@/app/calendar/Modal.css";
import { divideResourcesFromUserList } from "@/app/calendar/calendarUtils/calendarFetch";
import { StandardToggleModal } from "@/app/components/StandardToggleModal";
import { StandardViewField } from "@/app/components/StandardViewFIeld";
import { useUser } from "@/app/components/UserContext";
import { StringEvent } from "@/utils/db/db";
import moment from "moment-timezone";
import React from "react";
import {
	getDropContent,
	getTextFromStatus,
	getTextFromTriggerList
} from "../calendarUtils/calendarUX";

type StringEventFrontend = Omit<StringEvent, "userIdList"> & {
	usernameList: string[];
};

export function ViewEventModal({
	event,
	show,
	resourceId,
	setShow
}: {
	event: StringEventFrontend;
	show: boolean;
	resourceId: string | string[];
	setShow: (show: boolean) => void;
}) {
	const { users, resources } = divideResourcesFromUserList(
		event.usernameList
	);

	const { user } = useUser();

	async function handleDrop() {
		const response = await fetch("/api/calendar/quit/" + resourceId, {
			method: "POST",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({ _id: event._id })
		});

		if (response.ok) {
			alert("Evento abbandonato con successo!");
			window.location.reload();
		}
	}

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

	function getSingleViewMap() {
		if (!user) return null;

		const adminViews = {
			Abbandona: {
				title: "Abbandona Evento",
				buttonColor: "danger",
				saveBtnText: "",
				onSubmit: undefined,
				renderChildren: () => {
					return getDropContent(event.summary, handleDrop, true);
				}
			}
		};

		return user.username === "admin" ? adminViews : null;
	}

	return (
		<StandardToggleModal
			show={show}
			mainView={getMainView()}
			singleViewsMap={getSingleViewMap()}
		/>
	);
}
