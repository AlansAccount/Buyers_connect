import Layout from "@/components/Layout";
import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { WebSocketProvider } from "@/context/WebSocketContext";
import { UserProvider } from "@/context/UserContext";
import { Toaster } from "react-hot-toast";

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
	return (
		<UserProvider>
			<WebSocketProvider>
				<Layout>
					<Component {...pageProps} />
					<Toaster position="top-right" />
				</Layout>
			</WebSocketProvider>
		</UserProvider>
	);
};

export default MyApp;
