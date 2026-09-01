<script lang="ts">
	import { resolve } from "$app/paths";
</script>

<footer class="footer piko-prose">
	<p>
		&copy; 2011 - {new Date().getFullYear()} hammerspace.co.uk /
		<a href={resolve("/piko")}>Piko design system</a>
		/ <a href={resolve("/admin")}>Admin</a>
	</p>
	<p>
		<small>
			Look Ma, no cookie banner. Anything stored in your browser is purely
			functional. No information is stored about you or shared with anyone. Your
			IP address may be used to estimate your location to see which regions
			generate the most traffic, but is not stored after that estimation. A
			cookie may be set to prevent double counting of page views, but is not
			used for tracking (which is acceptable without a cookie banner under the
			UK's
			<a
				href="https://www.legislation.gov.uk/ukpga/2025/18/section/112"
				target="_blank">DUAA</a
			>
			and
			<a
				href="https://digital-strategy.ec.europa.eu/en/faqs/digital-package"
				target="_blank">EU Digital Omnibus Package</a
			>). <br />
			This site is proxied via Cloudflare, which may collect some information about
			your visit. See
			<a href="https://www.cloudflare.com/privacypolicy/" target="_blank"
				>Cloudflare's privacy policy</a
			>.
		</small>
	</p>
</footer>

<style>
	.footer {
		text-align: justify;
		margin-top: var(--piko-space-6);
		background: var(--piko-color-background-secondary);
		padding: var(--piko-unit);
	}
</style>
