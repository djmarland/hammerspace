<script lang="ts">
    import PostEditorForm from "@/components/Admin/PostEditorForm.svelte";
    import type {PageData} from "./$types";

    interface Props {
		data: PageData;
	}

	let { data }: Props = $props();
</script>

<svelte:head>
	<title>Create New Post</title>
</svelte:head>

<div class="piko-page-container piko-vstack">
    <h1 class="piko-t-h1">Create New Post</h1>
	<PostEditorForm
		action="?/create"
		submitLabel="Create Post"
		tags={data.tags}
	/>
</div>
