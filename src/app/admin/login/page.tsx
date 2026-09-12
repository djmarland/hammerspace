import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
	title: "Admin Login",
};

// `useSearchParams()` (used inside the fully client-driven `LoginForm`, to
// read the one-time `?token=...` bootstrap param) requires a Suspense
// boundary around it per Next.js's App Router docs, so this thin server
// page just supplies that boundary rather than being "use client" itself.
export default function AdminLoginPage() {
	return (
		<Suspense fallback={null}>
			<LoginForm />
		</Suspense>
	);
}
