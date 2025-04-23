import Link from "next/link";
import { useRouter } from "next/router";
import { UserContext } from "@/context/UserContext";
import { useContext } from "react";
import NotificationIcon from "./NavBar/NotificationIcon";

const Navbar: React.FC = () => {
	const { user, setUser } = useContext(UserContext);
	const router = useRouter();

	return (
		<nav className="w-full bg-gray-100 py-6 shadow-md">
			<div className="container mx-auto flex justify-between items-center px-9">
				<div className="flex space-x-7">
					{user?.role === "agent" && (
						<Link
							href="/become-featured"
							className="text-gray-700 hover:text-black transition"
						>
							Become a Featured Agent
						</Link>
					)}
					{user?.role === "buyer" && (
						<Link
							href="/agents"
							className="text-gray-700 hover:text-black transition"
						>
							Find an Agent
						</Link>
					)}
					<Link
						href="/how-it-works"
						className="text-gray-700 hover:text-black transition"
					>
						How it works
					</Link>
				</div>

				{/* Center - Logo (Clickable, Redirects to Home) */}
				<div className="absolute left-1/2 transform -translate-x-1/2">
					<Link href="/" className="text-2xl font-bold text-gray-900">
						Buyers Connect
					</Link>
				</div>

				{/* Right Side - Login/Signup */}
				<div className="flex space-x-8">
					{/* <Link
						href="/advertise"
						className="text-gray-700 hover:text-black transition"
					>
						Advertise
					</Link> */}
					<Link
						href="/help"
						className="text-gray-700 hover:text-black transition"
					>
						Help
					</Link>

					{user ? (
						<>
							<Link
								href="/notifications"
								className="relative flex items-center"
							>
								<NotificationIcon />
								<span className="sr-only">View notifications</span>
							</Link>

							<Link
								href="/dashboard"
								className="text-gray-700 hover:text-black transition"
							>
								Dashboard
							</Link>
							{user?.role === "agent" && (
								<Link
									href="/CreateProperty"
									className="text-gray-700 hover:text-black transition"
								>
									Create Property
								</Link>
							)}
							{user?.role === "buyer" && (
								<Link
									href="/saved"
									className="text-gray-700 hover:text-black transition"
								>
									Saved Listings
								</Link>
							)}
							<button
								onClick={() => {
									localStorage.removeItem("token");
									setUser(null);
									router.push("/login");
								}}
								className="text-gray-700 hover:text-red-500 transition"
							>
								Logout
							</button>
						</>
					) : (
						<>
							<Link
								href="/login"
								className="text-gray-700 hover:text-black transition"
							>
								Login
							</Link>
							<Link
								href="/agent-register"
								className="text-gray-700 hover:text-black transition"
							>
								Register as Agent
							</Link>

							<Link
								href="/register"
								className="text-gray-700 hover:text-black transition"
							>
								Signup
							</Link>
						</>
					)}
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
