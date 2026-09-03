<script>
    import SidePageHeader from "@/components/Blog/SidePageHeader.svelte";
    import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate.svelte";
    import Socials from "@/components/Molecules/Socials/Socials.svelte";
</script>

<svelte:head>
	<title>About | Hammerspace</title>
</svelte:head>

<SiteTemplate>
	{#snippet header()}
		<SidePageHeader title="About">
			<img
				class="profile"
				src="/profile.jpeg"
				alt="David, wearing sunglasses, a hat and white shirt"
			/>
		</SidePageHeader>
	{/snippet}
	<div class="piko-prose">
		<Socials />
		<p>
			Hello, I am David Marland. I have been developing websites since 1999.
		</p>
	</div>
</SiteTemplate>

<style>
	.profile {
		width: 100%;
		max-width: 140px;
		height: auto;
		border-radius: 200px;
		aspect-ratio: 1;
	}
</style>
