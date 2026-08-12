<script lang="ts">
	import PasskeySetup from '@/components/PasskeySetup.svelte';
	import LogoutButton from '@/components/Organisms/LogoutButton/LogoutButton.svelte';
	import styles from './page.module.css';
	import type { PageData } from './$types';

	export let data: PageData;

	let session = data.session;
	let setupPasskey = data.setupPasskey;

	$: ({ session, setupPasskey } = data);
</script>

<svelte:head>
	<title>Admin Dashboard</title>
</svelte:head>

<div class={styles.container}>
	<header class={styles.header}>
		<h1>Admin Dashboard</h1>
		<p>Welcome, {session.name || 'Admin'}</p>
	</header>

	{#if setupPasskey && !session.hasPasskey}
		<p>
			Please add your passkey now. Your login token will be invalidated after
			setup.
		</p>
	{/if}

	<PasskeySetup hasPasskey={session.hasPasskey} />

	<nav class={styles.nav}>
		<a href="/admin/posts" class={styles.button}>Manage Posts</a>
		<a href="/admin/posts/new" class={styles.button}>New Post</a>
		<a href="/admin/tags" class={styles.button}>Manage Tags</a>
		<LogoutButton />
	</nav>

	<section class={styles.content}>
		<p>Manage drafts, publish posts, and edit existing content.</p>
	</section>
</div>
