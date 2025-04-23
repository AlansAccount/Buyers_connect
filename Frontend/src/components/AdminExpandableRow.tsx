import { useState } from "react";

interface ExpandableRowProps {
	titleRow: React.ReactNode; // multiple <td>s
	children: React.ReactNode;
	colSpan?: number; // total columns to span
}

const ExpandableRow: React.FC<ExpandableRowProps> = ({
	titleRow,
	children,
	colSpan = 3, // matches table columns
}) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			<tr
				className="cursor-pointer hover:bg-gray-500"
				onClick={() => setOpen(!open)}
			>
				{titleRow}
			</tr>
			{open && (
				<tr className="bg-gray-50">
					<td colSpan={colSpan} className="p-4 text-sm text-black">
						{children}
					</td>
				</tr>
			)}
		</>
	);
};

export default ExpandableRow;
