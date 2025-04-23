import { createContext, useEffect, useState, useContext } from "react";
import { io, Socket } from "socket.io-client";
import { UserContext } from "./UserContext";

interface User {
	id: number;
	email: string;
	role: string;
	token: string;
}

interface ContextType {
	user: User | null;
}

export const WebSocketContext = createContext<{
	socket: Socket | null;
	messages: any[];
}>({ socket: null, messages: [] });

export const WebSocketProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	const [messages, setMessages] = useState<any[]>([]);
	const { user } = useContext(UserContext);

	useEffect(() => {
		const token = localStorage.getItem("token");

		const newSocket = io("ws://localhost:5000", {
			transports: ["websocket"],
			auth: {
				token,
			},
		});
		newSocket.on("connect", () => {
			console.log("Connect to WebSocket:", newSocket.id);
		});
		newSocket.on("disconnect", () => {
			console.log("Disconnected from WebSocket");
		});
		// Listen for incoming messages dynamically.
		newSocket.onAny((event, message) => {
			if (event.startsWith("message-")) {
				console.log("Received Message:", message);
				setMessages((prevMessages) => [...prevMessages, message]);
			}
		});

		setSocket(newSocket);
		return () => {
			newSocket.disconnect();
		};
	}, []);

	useEffect(() => {
		if (socket && user?.id) {
			socket.emit("joinRoom");
			console.log("Joined WebSocket room:", `user-${user.id}`);
		}
	}, [socket, user]);

	return (
		<WebSocketContext.Provider value={{ socket, messages }}>
			{children}
		</WebSocketContext.Provider>
	);
};
