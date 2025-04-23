import { useContext, useEffect, useState } from "react";
import { WebSocketContext } from "@/context/WebSocketContext";

const WebSocketTest = () => {
	const { socket, messages } = useContext(WebSocketContext);
	const [message, setMessage] = useState("");
	const [receiverId, setReceiverId] = useState(2);

	useEffect(() => {
		if (socket) {
			socket.emit("joinRoom"); // 👈 no param needed anymore
		}
	}, [socket]);

	const sendMessage = () => {
		if (socket) {
			socket.emit("sendMessage", {
				receiverId,
				content: message,
			});
			setMessage("");
		} else {
			console.error("WebSocket not conencted.");
		}
	};

	return (
		<div className="p-4 border roundeed-md shadow-md bg-white max-w-md">
			<h2 className="text-xl font-semibold mb-3">Test WebSocket</h2>

			{/* Display Messages */}
			<div className="border p-2 h-40 overflow-y-auto">
				<h3 className="font-medium mb-2 text-black">Received Messages:</h3>
				{messages.length === 0 ? (
					<p className="text-gray-500">No Messages yet.</p>
				) : (
					messages.map((msg, index) => (
						<div key={index} className="p-2 border-b text-black">
							<strong>From:</strong> {msg.sender_id} <br />
							<strong>Message:</strong> {msg.content}
						</div>
					))
				)}
			</div>

			{/* Input & Send Button */}
			<input
				type="text"
				value={message}
				onChange={(event) => {
					setMessage(event.target.value);
				}}
				placeholder="Enter a message..."
				className="boder p-2 w-full rounded-md"
			/>
			<button
				onClick={sendMessage}
				className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-md"
			>
				Send
			</button>
		</div>
	);
};

export default WebSocketTest;
