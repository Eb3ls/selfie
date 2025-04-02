import React, { useState } from "react";
import { StandardModal } from "./StandardModal";

export interface SingleView {
	title: string;
	buttonColor: string;
	icon?: React.ReactNode;
	saveBtnText: string;
	onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
	renderChildren: () => React.ReactNode;
}

export interface MainView
	extends Omit<SingleView, "onSubmit" | "buttonColor" | "saveBtnText"> {
	handleClose: () => void;
	// Undefined é il valore di una prop non passata
	onSubmit?: undefined;
	buttonColor?: undefined;
	saveBtnText?: undefined;
}

interface StandardToggleModalProps {
	show: boolean;
	mainView: MainView;
	singleViewsMap: { [key: string]: SingleView } | null;
}

export function StandardToggleModal({
	show,
	mainView,
	singleViewsMap
}: StandardToggleModalProps) {
	// Usiamo la chiave per non avere children statici
	const [currentViewKey, setCurrentViewKey] = useState<string | null>(null);

	function handleToggle(viewKey: string | null) {
		setCurrentViewKey(viewKey);
	}

	function getViewProp<K extends keyof SingleView>(
		prop: K
	): SingleView[K] | undefined {
		let value: any;
		if (currentViewKey && singleViewsMap) {
			// Recuperiamo la vista corrente dalla mappa
			value = singleViewsMap[currentViewKey][prop];
		} else {
			if (
				prop === "onSubmit" ||
				prop === "buttonColor" ||
				prop === "saveBtnText"
			) {
				return undefined;
			}
			value = mainView[prop as keyof MainView];
		}
		if (prop === "renderChildren" && typeof value === "function") {
			return value();
		}
		return value;
	}

	function getExtraHeaderButtons() {
		// Se non ci sono altre viste, non mostriamo i pulsanti
		if (!singleViewsMap) {
			return null;
		}

		if (currentViewKey) {
			return (
				<button
					className="btn btn-warning"
					onClick={() => handleToggle(null)}
				>
					Annulla
				</button>
			);
		}
		return Object.entries(singleViewsMap).map(([name, view]) => (
			<button
				onClick={() => handleToggle(name)}
				className={`btn btn-${view.buttonColor} me-2`}
				key={name}
			>
				{name}
			</button>
		));
	}

	return (
		<StandardModal
			title={getViewProp("title") || ""}
			titleIcon={getViewProp("icon")}
			saveBtnText={getViewProp("saveBtnText")}
			show={show}
			showCloseButton={currentViewKey === null}
			handleClose={() => {
				handleToggle(null);
				mainView.handleClose();
			}}
			handleSubmit={getViewProp("onSubmit")}
			extraHeaderButtons={getExtraHeaderButtons()}
		>
			{getViewProp("renderChildren") as React.ReactNode}
		</StandardModal>
	);
}
