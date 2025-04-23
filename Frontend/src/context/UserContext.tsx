import { createContext, useState, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface User {
	id: number;
	email: string;
	role: string;
	token: string;
}

interface ContextType {
	user: User | null;
	setUser: (user: User | null) => void;
	loading: boolean;
}

export const UserContext = createContext<ContextType>({
	user: null,
	setUser: () => {},
	loading: true, // Add the missing 'loading' property
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("token");

		if (!token) {
			setUser(null); // <- clear the user.
			setLoading(false);
			return;
		}
		try {
			const decoded: any = jwtDecode(token);
			// Temporary Log for Decoked token
			console.log("Decoded Token:", decoded);

			setUser({
				id: decoded.id,
				email: decoded.email,
				role: decoded.role,
				token,
			});
		} catch (err) {
			localStorage.removeItem("token");
			setUser(null); // Ensures cleanup.
		}
		setLoading(false); // done loading
	}, []);

	// typeof window !== "undefined" && localStorage.getItem("token")

	return (
		<UserContext.Provider value={{ user, setUser, loading }}>
			{children}
		</UserContext.Provider>
	);
};
