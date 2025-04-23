import React from "react";
import {
	MAIN_PROPERTY_TYPES,
	SUB_PROPERTY_TYPES,
} from "../../../constants/propertyConstants";
/**
 * We rename the props so they match exactly what you're passing in from CreateProperty:
 * mainValue, subValue, onChangeMain, onChangeSub
 */
interface TwoLevelSelectProps {
	// The currently selected main category
	mainValue: string;
	// The currently selected subcategory
	subValue: string;
	// Callback invoked when the user picks a new main category
	onChangeMain: (category: string) => void;
	// Callback invoked when the user picks a new sub-type (or types in "Other")
	onChangeSub: (subType: string) => void;
}

export const TwoLevelSelect: React.FC<TwoLevelSelectProps> = ({
	mainValue,
	subValue,
	onChangeMain,
	onChangeSub,
}) => {
	// Handler for main category
	const handleMainCategoryChange = (
		e: React.ChangeEvent<HTMLSelectElement>
	) => {
		const category = e.target.value;
		// Let the parent (CreateProperty) handle setting mainValue in its state
		onChangeMain(category);
	};

	// Handler for subcategory
	const handleSubTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const subType = e.target.value;
		onChangeSub(subType);
	};

	// Handler for "Other" text
	const handleCustomSubTypeChange = (
		e: React.ChangeEvent<HTMLInputElement>
	) => {
		onChangeSub(e.target.value);
	};

	// Get the array of subTypes for the selected main category
	const subTypeGroup = SUB_PROPERTY_TYPES.find(
		(group) => group.category === mainValue
	);

	return (
		<div>
			{/* MAIN CATEGORY SELECT */}
			<select value={mainValue} onChange={handleMainCategoryChange}>
				<option value="">-- Select Main Category --</option>
				{MAIN_PROPERTY_TYPES.map((category) => (
					<option key={category} value={category}>
						{category}
					</option>
				))}
			</select>

			{/* SUBCATEGORY SELECT (populated dynamically) */}
			{mainValue && (
				<select value={subValue} onChange={handleSubTypeChange}>
					<option value="">-- Select Subcategory --</option>
					{subTypeGroup?.subTypes.map((subType) => (
						<option key={subType} value={subType}>
							{subType}
						</option>
					))}
					<option value="other">Other</option>
				</select>
			)}

			{/* If user picks "other" in the subcategory */}
			{subValue === "other" && (
				<div style={{ marginTop: "8px" }}>
					<label>
						Please specify:
						<input
							type="text"
							value={subValue === "other" ? "" : subValue}
							onChange={handleCustomSubTypeChange}
							style={{ marginLeft: "8px" }}
						/>
					</label>
				</div>
			)}
		</div>
	);
};
