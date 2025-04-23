import React, { useState } from "react";
import { PROPERTY_TYPES } from "@/pages/CreateProperty";

interface SingleSelectExampleProps {
	// Example of a callback to pass the selected value up to a parent component
	onSelectionChange?: (value: string) => void;
}

export const SingleSelectExample: React.FC<SingleSelectExampleProps> = ({
	onSelectionChange,
}) => {
	// Keep track of the selected value
	const [selected, setSelected] = useState<string>("");

	// Track a custom "other" value if the user chooses "Other"
	const [otherValue, setOtherValue] = useState<string>("");

	const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
		const value = e.target.value;
		setSelected(value);
		// Notify parent if needed
		onSelectionChange?.(value);
	};

	const handleOtherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setOtherValue(e.target.value);
		// Optional: notify parent with the 'other' text
		onSelectionChange?.(e.target.value);
	};

	return (
		<div>
			<select value={selected} onChange={handleSelectChange}>
				<option value="">-- Select a Property Type --</option>
				{PROPERTY_TYPES.map((type) => (
					<option key={type} value={type}>
						{type}
					</option>
				))}
				<option value="other">Other</option>
			</select>

			{/* If the user selects "other," show an input box */}
			{selected === "other" && (
				<div style={{ marginTop: "8px" }}>
					<label>
						Please specify:
						<input
							type="text"
							value={otherValue}
							onChange={handleOtherChange}
							style={{ marginLeft: "8px" }}
						/>
					</label>
				</div>
			)}
		</div>
	);
};
