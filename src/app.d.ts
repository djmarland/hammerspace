import type { AdminSessionUser } from "$lib/admin-auth";

declare global {
	namespace App {
		interface Locals {
			session: AdminSessionUser | null;
		}
	}
}

export {};
