
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/admin" | "/admin/login" | "/admin/posts" | "/admin/posts/new" | "/admin/posts/[id]" | "/admin/posts/[id]/edit" | "/admin/tags" | "/api" | "/api/auth" | "/api/auth/logout" | "/api/auth/token-login" | "/api/auth/webauthn" | "/api/auth/webauthn/authenticate-options" | "/api/auth/webauthn/register-options" | "/api/auth/webauthn/verify-authenticate" | "/api/auth/webauthn/verify-register" | "/blog" | "/blog/[slug]" | "/feed.xml" | "/piko" | "/search" | "/tags" | "/tags/[slug]";
		RouteParams(): {
			"/admin/posts/[id]": { id: string };
			"/admin/posts/[id]/edit": { id: string };
			"/blog/[slug]": { slug: string };
			"/tags/[slug]": { slug: string }
		};
		LayoutParams(): {
			"/": { id?: string | undefined; slug?: string | undefined };
			"/admin": { id?: string | undefined };
			"/admin/login": Record<string, never>;
			"/admin/posts": { id?: string | undefined };
			"/admin/posts/new": Record<string, never>;
			"/admin/posts/[id]": { id: string };
			"/admin/posts/[id]/edit": { id: string };
			"/admin/tags": Record<string, never>;
			"/api": Record<string, never>;
			"/api/auth": Record<string, never>;
			"/api/auth/logout": Record<string, never>;
			"/api/auth/token-login": Record<string, never>;
			"/api/auth/webauthn": Record<string, never>;
			"/api/auth/webauthn/authenticate-options": Record<string, never>;
			"/api/auth/webauthn/register-options": Record<string, never>;
			"/api/auth/webauthn/verify-authenticate": Record<string, never>;
			"/api/auth/webauthn/verify-register": Record<string, never>;
			"/blog": { slug?: string | undefined };
			"/blog/[slug]": { slug: string };
			"/feed.xml": Record<string, never>;
			"/piko": Record<string, never>;
			"/search": Record<string, never>;
			"/tags": { slug?: string | undefined };
			"/tags/[slug]": { slug: string }
		};
		Pathname(): "/" | "/admin" | "/admin/login" | "/admin/posts" | "/admin/posts/new" | `/admin/posts/${string}/edit` & {} | "/admin/tags" | "/api/auth/logout" | "/api/auth/token-login" | "/api/auth/webauthn/authenticate-options" | "/api/auth/webauthn/register-options" | "/api/auth/webauthn/verify-authenticate" | "/api/auth/webauthn/verify-register" | "/blog" | `/blog/${string}` & {} | "/feed.xml" | "/piko" | "/search" | `/tags/${string}` & {};
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): "/globals.css" | string & {};
	}
}