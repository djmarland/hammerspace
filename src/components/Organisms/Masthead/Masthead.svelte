<script lang="ts">
    import Logo from "@/components/Atoms/Logo/Logo.svelte";
    import {resolve} from "$app/paths";
    import LogoutButton from "@/components/Organisms/LogoutButton/LogoutButton.svelte";
</script>

<header class="masthead">
	<div class="piko-page-container masthead__container">
        <div>
		<a href={resolve("/")}>
			<Logo />
		</a>
            </div>
        <nav>
        <ul class="masthead__nav">
            <li><a href={resolve("/admin/posts/new")}>New Post</a></li>
            <li><a href={resolve("/admin/posts")}>Posts</a></li>
            <li><a href={resolve("/admin/tags")}>Tags</a></li>
            <li>

            <LogoutButton />
            </li>
        </ul>
        </nav>
	</div>
</header>

<style>
	.masthead {
		:global(svg) {
			width: 200px;
			margin-block: var(--piko-unit);
		}
		background-color: color-mix(
			in srgb,
			var(--piko-palette-dynamic-8) 10%,
			var(--piko-color-background) 90%
		);
		position: sticky;
		top: 0;
          margin-bottom: var(--piko-unit-double);
	}

    .masthead__container {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: var(--piko-half) var(--piko-unit);
      align-items: stretch;
    }

    .masthead__nav {
        display: flex;
        justify-self: center;
        align-items: stretch;
        height: 100%;

      :global(form) {
        height: 100%;
      }
      :global(a), :global(button) {
        display: flex;
        align-items: center;
        height: 100%;
        padding: var(--piko-unit);
        text-decoration: none;
        color: var(--piko-color-link);
        &:hover {
          background-color: var(--piko-color-link);
          color: color-mix(
			in srgb,
			var(--piko-palette-dynamic-8) 10%,
			var(--piko-color-background) 90%
		);
        }
      }
    }

</style>
