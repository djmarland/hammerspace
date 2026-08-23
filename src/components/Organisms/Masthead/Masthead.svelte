<script lang="ts">
    import Logo from "@/components/Atoms/Logo/Logo.svelte";
    import {resolve} from "$app/paths";
</script>

<header class="masthead">
	<div class="container">
		<p>
			<a href={resolve("/")}>
				<Logo />
			</a>
		</p>
	</div>
</header>

<style>
	.masthead {
		background:
			radial-gradient(
				circle at 15% 20%,
				color-mix(
						in srgb,
						var(--piko-palette-dynamic-4) 42%,
						transparent
					)
					0%,
				transparent 38%
			),
			radial-gradient(
				circle at 85% 80%,
				color-mix(
						in srgb,
						var(--piko-palette-dynamic-4) 38%,
						transparent
					)
					0%,
				transparent 46%
			),
			radial-gradient(
				ellipse at 60% 30%,
				color-mix(in srgb, var(--piko-palette-white) 18%, transparent) 0%,
				transparent 58%
			),
			radial-gradient(
				ellipse at 25% 80%,
				color-mix(
						in srgb,
						var(--piko-palette-dynamic-3) 24%,
						transparent
					)
					0%,
				transparent 55%
			),
			radial-gradient(
				ellipse at 78% 12%,
				color-mix(
						in srgb,
						var(--piko-palette-dynamic-3) 22%,
						transparent
					)
					0%,
				transparent 52%
			),
			var(--piko-palette-grey-8);
		border-bottom: 1px solid
			color-mix(
				in srgb,
				var(--piko-palette-dynamic-5) 65%,
				var(--piko-palette-grey-7)
			);
		padding: var(--piko-unit) var(--piko-space-4);
		position: sticky;
		top: 0;
		animation: masthead-glow 16s ease-in-out infinite alternate;
	}

	@keyframes masthead-glow {
		0% {
			background-position:
				0 0,
				100% 100%,
				0 0;
		}
		100% {
			background-position:
				8% 12%,
				92% 88%,
				0 0;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.masthead {
			animation: none;
		}
	}

	@media (max-width: 56rem) {
		.container {
			display: flex;
			justify-content: center;
			text-align: center;
		}

		.container p {
			margin: 0;
		}
	}
</style>
