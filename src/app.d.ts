import type { AdminSessionUser } from "$lib/admin-auth";

declare global {
	namespace App {
		type State = "error" | "success" | "warning" | "info";

		interface Locals {
			session: AdminSessionUser | null;
		}
	}
}

export {};
