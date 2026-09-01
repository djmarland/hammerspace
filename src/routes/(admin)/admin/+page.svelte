<script lang="ts">
	import { resolve } from "$app/paths";
	import PasskeySetup from "@/components/PasskeySetup.svelte";
	import LogoutButton from "@/components/Organisms/LogoutButton/LogoutButton.svelte";
	import type { PageData } from "./$types";

	type Props = { data: PageData };
	let { data }: Props = $props();
	const session = $derived(data.session);
	const setupPasskey = $derived(data.setupPasskey);
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<div class="container">
	<header class="header">
		<h1>Admin Dashboard</h1>
		<p>Welcome, {session.name || "Admin"}</p>
	</header>

	{#if setupPasskey && !session.hasPasskey}
		<p>
			Please add your passkey now. Your login token will be invalidated after
			setup.
		</p>
	{/if}

	<PasskeySetup hasPasskey={session.hasPasskey} />

	<nav class="nav">
		<a href={resolve("/admin/posts")} class="button">Manage Posts</a>
		<a href={resolve("/admin/posts/new")} class="button">New Post</a>
		<a href={resolve("/admin/tags")} class="button">Manage Tags</a>
		<LogoutButton />
	</nav>

	<section class="content">
		<p>Manage drafts, publish posts, and edit existing content.</p>
	</section>
</div>

<style>
	.container {
		max-width: var(--piko-page-max);
		margin: 0 auto;
		padding: var(--piko-space-5);
	}

	.header {
		text-align: center;
		margin-bottom: var(--piko-space-7);
		padding: var(--piko-space-7) var(--piko-space-5);
		border-bottom: 1px solid var(--piko-color-border);
	}

	.header h1 {
		font-size: 2.5rem;
		margin-bottom: var(--piko-space-2);
	}

	.header p {
		font-size: 1rem;
		color: var(--piko-color-text-subtle);
	}

	.nav {
		display: flex;
		gap: var(--piko-space-2);
		margin-bottom: var(--piko-space-7);
		padding: var(--piko-space-5) 0;
	}

	.button {
		padding: var(--piko-space-control-padding-y)
			var(--piko-space-control-padding-x);
		border: 1px solid var(--piko-color-primary-border);
		border-radius: 0;
		background-color: var(--piko-color-primary-bg);
		color: var(--piko-color-primary-text);
		text-decoration: none;
		cursor: pointer;
		font-size: 1rem;
		transition: all 0.2s ease;
	}

	.button:hover {
		background-color: var(--piko-color-primary-border);
		border-color: var(--piko-color-primary-border);
	}

	.content {
		margin-top: var(--piko-space-7);
	}
</style>
