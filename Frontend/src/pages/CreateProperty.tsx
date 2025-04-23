import { UserContext } from "@/context/UserContext";
import { useContext, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { TwoLevelSelect } from "@/components/property_selectors/TwoDropdown";

// In a shared constants.ts or directly in your form
export const PROPERTY_TYPES = ["house", "apartment", "townhouse", "land"];

const CreateProperty: React.FC = () => {
	const { user, loading } = useContext(UserContext);
	const router = useRouter();

	// Local state for Form Fields.
	const [title, setTitle] = useState("");
	const [price, setPrice] = useState("");
	const [description, setDescription] = useState("");
	const [location, setLocation] = useState("");
	const [error, setError] = useState("");
	const [success, setSuccess] = useState("");
	const [propertyType, setPropertyType] = useState("");

	// Two-level approach: store main/sub in separate states
	const [mainCategory, setMainCategory] = useState("");
	const [subCategory, setSubCategory] = useState("");

	// To Avoid flashing content by waiting for context to load.
	// Ensure onl agents access this page.
	useEffect(() => {
		if (!loading && (!user || user.role !== "agent")) {
			router.replace("/");
		}
	}, [user, loading, router]);

	// Block render before user is loaded
	// Prevent rendering until loading is complete.
	if (loading || user?.role !== "agent") {
		return null;
	}

	// Form Submission Handler
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSuccess("");

		// Basic front-end validation
		if (
			!title ||
			!price ||
			!description ||
			!location ||
			!mainCategory ||
			!subCategory
		) {
			setError("Please fill in all required fields.");
			return;
		}

		try {
			// Combine main/sub into a single string if needed, or handle differently
			const propertyType = `${mainCategory} - ${subCategory}`;

			// POST request to backend API (endpoint must be ready).

			const res = await fetch("http://localhost:5000/api/properties", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${user.token}`, // Send token for auth.
				},
				body: JSON.stringify({
					title,
					price,
					description,
					location,
					property_main_type: mainCategory,
					property_sub_type: subCategory,
				}),
			});

			const data = await res.json();

			console.log("The response was: ", res, data);

			if (!res.ok) {
				console.log("The response was: ", res, data);
				throw new Error(data.message || "Failed to create property.");
			}

			setSuccess("Property created sucessfully!");

			// Optionally clear the form.
			setTitle("");
			setPrice("");
			setDescription("");
			setLocation("");
			setPropertyType("");
		} catch (err: any) {
			setError(err.message);
		}
	};

	return (
		<div className="p-6">
			<h1 className="text-2xl font-bold text-white">Create a New Listing.</h1>
			{error && <p className="text-red-500 mb-4">{error}</p>}
			{success && <p className="text-green-500 mb-4">{success}</p>}
			<p>New Property Listings below are ones you have created.</p>
			<form onSubmit={handleSubmit} className="flex flex-col space-y-4">
				<input
					type="text"
					placeholder="Title"
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					className="p-3 border rounded w-full text-black"
					required
				/>
				<input
					type="text"
					placeholder="Price" // Add a $ symbol or what ever based on what country they are living in, add
					value={price}
					onChange={(e) => setPrice(e.target.value)}
					className="p-3 border rounded w-full text-black"
					required
				/>

				<TwoLevelSelect
					mainValue={mainCategory}
					subValue={subCategory}
					onChangeMain={(val) => setMainCategory(val)}
					onChangeSub={(val) => setSubCategory(val)}
				/>

				<textarea
					placeholder="Description"
					value={description}
					onChange={(e) => setDescription(e.target.value)}
					className="p-3 border rounded w-full text-black"
					required
				/>
				<input
					type="text"
					placeholder="Location"
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					className="p-3 border rounded w-full text-black"
					required
				/>
				<button
					type="submit"
					className="bg-blue-600 text-white px-4 py-2 rounded w-full"
				>
					Create Property.
				</button>
			</form>
		</div>
	);
};

export default CreateProperty;
