<script lang="ts">
    import {resolve} from "$app/paths";
    import PikoToken from "@/components/PikoToken.svelte";
    import SidePageHeader from "@/components/Blog/SidePageHeader.svelte";
    import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate.svelte";

    const corePalettes = [
		{ label: "Slate", token: "slate" },
		{ label: "Red", token: "red" },
		{ label: "Orange", token: "orange" },
		{ label: "Yellow", token: "yellow" },
		{ label: "Green", token: "green" },
		{ label: "Teal", token: "teal" },
		{ label: "Blue", token: "blue" },
		{ label: "Violet", token: "violet" },
		{ label: "Pink", token: "pink" },
		{ label: "Dynamic", token: "dynamic" },
	] as const;

	const paletteSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

    //todo
	const semanticColors = [
		"--piko-color-background",
		"--piko-color-background-secondary",
		"--piko-color-text",
		"--piko-color-text-subtle",
		"--piko-color-border",
		"--piko-color-link",
		"--piko-color-primary-bg",
		"--piko-color-success-bg",
		"--piko-color-warning-bg",
		"--piko-color-error-bg",
	] as const;

	const typographyTokens = [
		"--piko-t-h1",
		"--piko-t-h2",
		"--piko-t-h3",
		"--piko-t-h4",
		"--piko-t-h5",
		"--piko-t-h6",
		"--piko-t-body",
		"--piko-t-small",
		"--piko-t-caption",
	] as const;

	const coreSpacingTokens = [
		{ label: "Unit", token: "--piko-unit" },
		{ label: "Quarter unit", token: "--piko-unit-quarter" },
		{ label: "Half unit", token: "--piko-unit-half" },
		{ label: "Double unit", token: "--piko-unit-double" },
		{ label: "Triple unit", token: "--piko-unit-triple" },
		{ label: "Quad unit", token: "--piko-unit-quad" },
	] as const;

	const semanticSpacingTokens = [
		{ label: "Grid gap", token: "--piko-gap-grid" },
		{ label: "Stack gap", token: "--piko-gap-stack" },
		{ label: "Cluster gap", token: "--piko-space-cluster-gap" },
		{ label: "Section gap", token: "--piko-space-section-gap" },
		{ label: "Card padding", token: "--piko-space-panel-padding" },
		{ label: "Control padding (x)", token: "--piko-space-control-padding-x" },
		{ label: "Control padding (y)", token: "--piko-space-control-padding-y" },
		{ label: "Page gutter", token: "--piko-space-page-gutter" },
	] as const;

	const states = ["primary", "success", "warning", "error"] as const;

	const docsNavGroups = [
		{
			title: "Core",
			sections: [
				{ id: "core-colours", label: "Colours" },
				{ id: "core-spacing", label: "Spacing units" },
				{ id: "core-font", label: "Font" },
			],
		},
		{
			title: "Semantic",
			sections: [
				{ id: "semantic-colours", label: "Colours" },
				{ id: "semantic-typography", label: "Typography" },
				{ id: "semantic-spacing", label: "Spacing roles" },
				{ id: "semantic-states", label: "States" },
			],
		},
		{
			title: "Components",
			sections: [
				{ id: "buttons", label: "Buttons" },
				{ id: "form-elements", label: "Form elements" }
			],
		},
		{
			title: "Reference",
			sections: [{ id: "html-kitchen-sink", label: "HTML Kitchen Sink" }],
		},
	] as const;
</script>

<svelte:head>
	<title>Piko</title>
</svelte:head>

<SiteTemplate>
	<SidePageHeader slot="header" title="Piko">
		<p class="intro">Piko is the design system for Hammerspace</p>
		<nav>
			<ul class="piko-docs-nav">
				{#each docsNavGroups as group (group.title)}
					<li>
						<p class="piko-docs-nav-title">{group.title}</p>
						<ul class="piko-docs-nav">
							{#each group.sections as section (section.id)}
								<li>
									<a href={`#${section.id}`}>{section.label}</a>
								</li>
							{/each}
						</ul>
					</li>
				{/each}
			</ul>
		</nav>
	</SidePageHeader>

	<div class="piko-docs-content">
		<section class="piko-docs-section piko-prose" id="core">
			<h2>Core</h2>
			<section id="core-colours">
				<h3>Colours</h3>
				<p>
					Core ramps are colour-name based and semantic roles map onto those
					ramps.
				</p>
				<div class="piko-token-grid">
					{#each corePalettes as palette (palette.token)}
						<div>
							<p>
								<strong>{palette.label}</strong>
							</p>
							<div class="piko-swatch-scale">
								{#each paletteSteps as step (`${palette.token}-${step}`)}
									{@const paletteToken = `--piko-palette-${palette.token}-${step}`}
									<div
										class="piko-swatch"
										style:background-color={`var(${paletteToken})`}
										style:color={`contrast-color(var(${paletteToken}))`}
									>
										<PikoToken token={paletteToken} />
									</div>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>
			<section id="core-spacing">
				<h3>Spacing units</h3>
				<table class="piko-space-table">
					<thead>
						<tr>
							<th>Label</th>
							<th>Token</th>
							<th>Preview</th>
						</tr>
					</thead>
					<tbody>
						{#each coreSpacingTokens as { label, token } (token)}
							<tr>
								<td>{label}</td>
								<td>
									<PikoToken {token} />
								</td>
								<td>
									<div
										class="piko-space-bar"
										style:width={`max(var(${token}), 0.125rem)`}
									></div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
		</section>

		<section class="piko-docs-section piko-prose" id="semantic">
			<h2>Semantic</h2>
			<section id="semantic-colours">
				<h3>Colours</h3>
				<div class="piko-token-grid">
					{#each semanticColors as token (token)}
						<div class="piko-token-chip">
							<div
								class="piko-swatch"
								style:background-color={`var(${token})`}
							></div>
							<PikoToken {token} />
						</div>
					{/each}
				</div>
			</section>
			<section id="semantic-typography">
				<h3>Typography</h3>
				<div class="piko-token-list">
					{#each typographyTokens as token (token)}
						<div class="piko-token-chip">
							<p style:font-size={`var(${token})`}>
								The quick brown fox jumps over the lazy dog.
							</p>
							<PikoToken {token} />
						</div>
					{/each}
				</div>
			</section>
			<section id="semantic-spacing">
				<h3>Spacing roles</h3>
				<table class="piko-space-table">
					<thead>
						<tr>
							<th>Label</th>
							<th>Token</th>
							<th>Preview</th>
						</tr>
					</thead>
					<tbody>
						{#each semanticSpacingTokens as { label, token } (token)}
							<tr>
								<td>{label}</td>
								<td>
									<PikoToken {token} />
								</td>
								<td>
									<div
										class="piko-space-bar"
										style:width={`max(var(${token}), 0.125rem)`}
									></div>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</section>
			<section id="semantic-states">
				<h3>States</h3>
				<div class="piko-token-list">
					{#each states as state (state)}
						<div>
							<p class="piko-state piko-state--box" data-state={state}>
								<strong>{state}</strong>: boxed mode using
								<PikoToken token={`data-state="${state}"`} />
							</p>
							<p class="piko-state piko-state--text" data-state={state}>
								{state} text mode using
								<PikoToken token=".piko-state--text" />
							</p>
						</div>
					{/each}
				</div>
			</section>
		</section>

        <section class="piko-docs-section piko-prose" id="buttons">
			<h2>Buttons</h2>

            <p><button>A default button (secondary)</button></p>
            <p><button class="piko-button--primary">A primary button</button></p>
            <p><button class="piko-button--tertiary">A tertiary button</button></p>
            <p><button class="piko-button--danger">A danger button</button></p>
        </section>

		<section class="piko-docs-section piko-prose" id="form-elements">
			<h2>Form elements</h2>
			<p>
				Examples of common form controls with labels, fieldsets, and various
				states.
			</p>

			<section id="form-text-inputs">
				<h3>Text inputs</h3>
				<div class="piko-form-demo">
					<div class="piko-form-field">
						<label for="demo-text">Full name</label>
						<input type="text" id="demo-text" placeholder="e.g. Jane Smith" />
					</div>
					<div class="piko-form-field">
						<label for="demo-email">Email address</label>
						<input type="email" id="demo-email" placeholder="you@example.com" />
					</div>
					<div class="piko-form-field">
						<label for="demo-password">Password</label>
						<input type="password" id="demo-password" placeholder="••••••••" />
					</div>
					<div class="piko-form-field">
						<label for="demo-number">Quantity</label>
						<input type="number" id="demo-number" value="1" min="1" max="99" />
					</div>
				</div>
			</section>

			<section id="form-helper-error">
				<h3>With helper text and errors</h3>
				<div class="piko-form-demo">
					<div class="piko-form-field">
						<label for="demo-hint">Username</label>
						<p class="piko-form-hint" id="demo-hint-description">
							Must be 3–20 characters. Letters, numbers, and underscores only.
						</p>
						<input
							type="text"
							id="demo-hint"
							aria-describedby="demo-hint-description"
							value="jane_smith"
						/>
					</div>
					<div class="piko-form-field" data-state="error">
						<label for="demo-error">Email address</label>
						<p
							class="piko-form-hint piko-state piko-state--text"
							data-state="error"
							id="demo-error-description"
						>
							Enter a valid email address.
						</p>
						<input
							type="email"
							id="demo-error"
							aria-describedby="demo-error-description"
							aria-invalid="true"
							value="not-an-email"
						/>
					</div>
				</div>
			</section>

			<section id="form-disabled">
				<h3>Disabled state</h3>
				<div class="piko-form-demo">
					<div class="piko-form-field">
						<label for="demo-disabled">Account ID</label>
						<input type="text" id="demo-disabled" value="ACC-00042" disabled />
					</div>
					<div class="piko-form-field">
						<label for="demo-disabled-select">Region</label>
						<select id="demo-disabled-select" disabled>
							<option>Europe (EU-West)</option>
						</select>
					</div>
				</div>
			</section>

			<section id="form-select-textarea">
				<h3>Select and textarea</h3>
				<div class="piko-form-demo">
					<div class="piko-form-field">
						<label for="demo-select">Country</label>
						<select id="demo-select">
							<option value="">Choose a country…</option>
							<option value="gb">United Kingdom</option>
							<option value="us">United States</option>
							<option value="de">Germany</option>
							<option value="fr">France</option>
						</select>
					</div>
					<div class="piko-form-field">
						<label for="demo-textarea">Message</label>
						<p class="piko-form-hint" id="demo-textarea-description">
							Max 500 characters.
						</p>
						<textarea
							id="demo-textarea"
							rows={4}
							aria-describedby="demo-textarea-description"
							placeholder="Write your message here…"></textarea>
					</div>
				</div>
			</section>

			<section id="form-checkboxes">
				<h3>Checkboxes</h3>
				<fieldset class="piko-fieldset">
					<legend>Notification preferences</legend>
					<p class="piko-form-hint">
						Choose which emails you'd like to receive.
					</p>
					<div class="piko-check-group">
						<div class="piko-check-item">
							<input type="checkbox" id="cb-product" checked />
							<label for="cb-product">Product updates</label>
						</div>
						<div class="piko-check-item">
							<input type="checkbox" id="cb-security" checked />
							<label for="cb-security">Security alerts</label>
						</div>
						<div class="piko-check-item">
							<input type="checkbox" id="cb-newsletter" />
							<label for="cb-newsletter">Newsletter</label>
						</div>
						<div class="piko-check-item">
							<input type="checkbox" id="cb-disabled" disabled />
							<label for="cb-disabled">Promotional offers (unavailable)</label>
						</div>
					</div>
				</fieldset>
			</section>

			<section id="form-radios">
				<h3>Radio buttons</h3>
				<fieldset class="piko-fieldset">
					<legend>Billing cycle</legend>
					<p class="piko-form-hint">
						Select how often you'd like to be billed.
					</p>
					<div class="piko-check-group">
						<div class="piko-check-item">
							<input
								type="radio"
								name="billing"
								id="r-monthly"
								value="monthly"
								checked
							/>
							<label for="r-monthly">Monthly</label>
						</div>
						<div class="piko-check-item">
							<input type="radio" name="billing" id="r-annual" value="annual" />
							<label for="r-annual"
								>Annual <span class="small quiet">(save 20%)</span></label
							>
						</div>
						<div class="piko-check-item">
							<input
								type="radio"
								name="billing"
								id="r-disabled"
								value="lifetime"
								disabled
							/>
							<label for="r-disabled">Lifetime (coming soon)</label>
						</div>
					</div>
				</fieldset>
			</section>

			<section id="form-full-example">
				<h3>Full form example</h3>
				<form class="piko-form-demo" action="#">
					<fieldset class="piko-fieldset">
						<legend>Account details</legend>
						<div class="piko-form-field">
							<label for="full-name">Full name</label>
							<input type="text" id="full-name" autocomplete="name" />
						</div>
						<div class="piko-form-field">
							<label for="full-email">Email address</label>
							<input type="email" id="full-email" autocomplete="email" />
						</div>
					</fieldset>
					<fieldset class="piko-fieldset">
						<legend>Communication preferences</legend>
						<div class="piko-check-group">
							<div class="piko-check-item">
								<input type="checkbox" id="full-cb-1" />
								<label for="full-cb-1">Email me about new features</label>
							</div>
							<div class="piko-check-item">
								<input type="checkbox" id="full-cb-2" checked />
								<label for="full-cb-2">Send me security alerts</label>
							</div>
						</div>
					</fieldset>
					<div class="piko-form-actions">
						<button type="submit" class="button primary">Save changes</button>
						<button type="reset" class="button secondary">Cancel</button>
					</div>
				</form>
			</section>
		</section>

		<section class="piko-docs-section piko-prose" id="html-kitchen-sink">
			<h2>HTML Kitchen Sink</h2>
			<p>
				The rest of this page demonstrates the default styles for all the HTML
				elements. Adapted from
				<a href="https://github.com/ericrasch/html-kitchen-sink/tree/master">
					ericrasch/html-kitchen-sink
				</a>
				.
			</p>
			<h1>
				This is the primary heading and there should only be one of these per
				page
			</h1>
			<p>
				A small paragraph to <em>emphasis</em> and show
				<strong>important</strong> bits.
			</p>
			<ul>
				<li>This is a list item</li>
				<li>So is this - there could be more</li>
				<li>
					Make sure to style list items to:
					<ul>
						<li>Not forgetting child list items</li>
						<li>Not forgetting child list items</li>
						<li>Not forgetting child list items</li>
						<li>Not forgetting child list items</li>
					</ul>
				</li>
				<li>A couple more</li>
				<li>top level list items</li>
			</ul>
			<p>
				Don't forget <strong>Ordered lists</strong>:
			</p>
			<ol>
				<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
				<li>
					Aliquam tincidunt mauris eu risus.
					<ol>
						<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
						<li>Aliquam tincidunt mauris eu risus.</li>
					</ol>
				</li>
				<li>Lorem ipsum dolor sit amet, consectetuer adipiscing elit.</li>
				<li>Aliquam tincidunt mauris eu risus.</li>
			</ol>
			<h2>
				A sub heading which is not as important as the first, but is quite
				imporant overall
			</h2>
			<p>
				Pellentesque habitant morbi tristique senectus et netus et malesuada
				fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae,
				ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam
				egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend
				leo.
			</p>
			<table>
				<caption>Most Downloaded Movies on BitTorrent, 2011</caption>
				<thead>
					<tr>
						<th>Rank</th>
						<th>Movie</th>
						<th>Downloads</th>
						<th>Grosses</th>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<th colspan="4">torrentfreak.com</th>
					</tr>
				</tfoot>
				<tbody>
					<tr>
						<th>1</th>
						<td>Fast Five</td>
						<td>9,260,000</td>
						<td>$626,137,675</td>
					</tr>
					<tr>
						<th>2</th>
						<td>The Hangover II</td>
						<td>8,840,000</td>
						<td>$581,464,305</td>
					</tr>
					<tr>
						<th>3</th>
						<td>Thor</td>
						<td>8,330,000</td>
						<td>$449,326,618</td>
					</tr>
					<tr>
						<th>4</th>
						<td>Source Code</td>
						<td>7,910,000</td>
						<td>$123,278,618</td>
					</tr>
					<tr>
						<th>5</th>
						<td>I Am Number Four</td>
						<td>7,670,000</td>
						<td>$144,500,437</td>
					</tr>
					<tr>
						<th>6</th>
						<td>Sucker Punch</td>
						<td>7,200,000</td>
						<td>$89,792,502</td>
					</tr>
					<tr>
						<th>7</th>
						<td>127 Hours</td>
						<td>6,910,000</td>
						<td>$60,738,797</td>
					</tr>
					<tr>
						<th>8</th>
						<td>Rango</td>
						<td>6,480,000</td>
						<td>$245,155,348</td>
					</tr>
					<tr>
						<th>9</th>
						<td>The King’s Speech</td>
						<td>6,250,000</td>
						<td>$414,211,549</td>
					</tr>
					<tr>
						<th>10</th>
						<td>Harry Potter and the Deathly Hallows Part 2</td>
						<td>6,030,000</td>
						<td>$1,328,111,219</td>
					</tr>
				</tbody>
			</table>
			<table>
				<tbody>
					<tr>
						<th>Table Heading</th>
						<th>Table Heading</th>
					</tr>
					<tr>
						<td>table data</td>
						<td>table data</td>
					</tr>
					<tr>
						<td>table data</td>
						<td>table data</td>
					</tr>
					<tr>
						<td>table data</td>
						<td>table data</td>
					</tr>
					<tr>
						<td>table data</td>
						<td>table data</td>
					</tr>
				</tbody>
			</table>
			<h3>
				A sub heading which is not as important as the second, but should be
				used with consideration
			</h3>
			<p>
				Pellentesque habitant morbi tristique senectus et netus et malesuada
				fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae,
				ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam
				egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend
				leo.
			</p>
			<blockquote>
				<p>
					<em>This is a properly formatted blockquote, btw.</em> Measuring programming
					progress by lines of code is like measuring aircraft building progress by
					weight.
				</p>
				<footer>
					—
					<cite>
						<a href="https://www.thegatesnotes.com">Bill Gates</a>
					</cite>
				</footer>
			</blockquote>
			<h4>
				A sub heading which is not as important as the second, but should be
				used with consideration
			</h4>
			<p>
				Pellentesque habitant morbi tristique senectus et netus et malesuada
				fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae,
				ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam
				egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend
				leo.
			</p>
			<blockquote>
				<p>
					“Ooh - a blockquote! Lorem ipsum dolor sit amet, consectetur
					adipiscing elit. Vivamus magna. Cras in mi at felis aliquet congue. Ut
					a est eget ligula molestie gravida. Curabitur massa. Donec eleifend,
					libero at sagittis mollis, tellus est malesuada tellus, at luctus
					turpis elit sit amet quam. Vivamus pretium ornare est.”
				</p>
			</blockquote>
			<h5>
				A sub heading which is not as important as the second, but should be
				used with consideration
			</h5>
			<p>
				Pellentesque habitant morbi tristique senectus et netus et malesuada
				fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae,
				ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam
				egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend
				leo.
			</p>
			<dl>
				<dt>Definition list</dt>
				<dd>
					Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
					labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
					exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</dd>
				<dt>Lorem ipsum dolor sit amet</dt>
				<dd>
					Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
					labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
					exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
				</dd>
			</dl>
			<h6>
				This heading plays a relatively small bit part role, if you use it at
				all
			</h6>
			<p>
				Pellentesque habitant morbi tristique senectus et netus et malesuada
				fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae,
				ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam
				egestas semper. Aenean ultricies mi vitae est. Mauris placerat eleifend
				leo.
			</p>
			<h1>Level 1 heading</h1>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h1 class="fancy">Level 1 heading class="fancy"</h1>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h1 class="thin">Level 1 heading class="thin"</h1>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h1 class="caps">Level 1 heading class="caps"</h1>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h2>Level 02 Heading</h2>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h2 class="fancy">Level 2 heading class="fancy"</h2>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h2 class="thin">Level 2 heading class="thin"</h2>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h2 class="caps">Level 2 heading class="caps"</h2>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h3>Level 03 Heading</h3>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h3 class="fancy">Level 3 heading class="fancy"</h3>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h3 class="thin">Level 3 heading class="thin"</h3>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h3 class="caps">Level 3 heading class="caps"</h3>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h4>Level 04 Heading</h4>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h4 class="fancy">Level 4 heading class="fancy"</h4>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h4 class="thin">Level 4 heading class="thin"</h4>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h4 class="caps">Level 4 heading class="caps"</h4>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h5>Level 05 Heading</h5>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h5 class="fancy">Level 5 heading class="fancy"</h5>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h5 class="thin">Level 5 heading class="thin"</h5>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h5 class="caps">Level 5 heading class="caps"</h5>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h6>Level 06 Heading</h6>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h6 class="fancy">Level 6 heading class="fancy"</h6>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h6 class="thin">Level 6 heading class="thin"</h6>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<h6 class="caps">Level 6 heading class="caps"</h6>
			<p>
				Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna justo,
				vehicula in, suscipit nec, molestie sed, tellus.
			</p>
			<blockquote>
				<p>
					Paragraph inside Blockquote: Nam libero leo, elementum in, dapibus a,
					suscipit vitae, purus. Duis arcu. Integer dignissim fermentum enim.
					Morbi convallis felis vel nibh. Sed scelerisque sagittis lorem.
				</p>
			</blockquote>
			<address>Address: Example address 224, Sweden</address>
			<pre><strong>Preformated:</strong>Testing one row and another</pre>
			<p>
				I am <a href={resolve("/piko?abc123")}>the a tag</a> example
				<br />I am <abbr title="test">the abbr tag</abbr> example
				<br />I am <big>the big tag</big> example
				<br />I am <cite>the cite tag</cite> example
				<br />I am <code>the code tag</code> example
				<br />I am <del>the del tag</del> example
				<br />I am <dfn>the dfn tag</dfn> example
				<br />I am <em>the em tag</em> example
				<br />I am <i>the i tag</i> example
				<br />I am <ins>the ins tag</ins> example
				<br />I am <kbd>the kbd tag</kbd> example
				<br />I am <q>the q tag</q> example
				<br />I am <samp>the samp tag</samp> example
				<br />I am <small>the small tag</small> example
				<br />I am <span>the span tag</span> example
				<br />I am <strong>the strong tag</strong> example
				<br />I am <sub>the sub tag</sub> example
				<br />I am <sup>the sup tag</sup> example
				<br />I am <var>the var tag</var> example
				<br />I am the <span class="small">small class</span> example
				<br />I am the <span class="large">large class</span> example
				<br />I am the <span class="quiet">quiet class</span> example
				<br />I am the <span class="highlight"> highlight class </span>
				example
				<br />
			</p>
			<hr />
			<ul>
				<li>Unordered list 01</li>
				<li>Unordered list 02</li>
				<li>
					Unordered list 03
					<ul>
						<li>Unordered list inside list level 2</li>
						<li>
							Unordered list inside list level 2
							<ul>
								<li>Unordered list inside list level 3</li>
								<li>Unordered list inside list level 3</li>
							</ul>
						</li>
					</ul>
				</li>
			</ul>
			<ol>
				<li>Ordered list 01</li>
				<li>Ordered list 02</li>
				<li>
					Ordered list 03
					<ol>
						<li>Ordered list inside list level 2</li>
						<li>
							Ordered list inside list level 2
							<ol>
								<li>Ordered list inside list level 3</li>
								<li>Ordered list inside list level 3</li>
							</ol>
						</li>
					</ol>
				</li>
			</ol>
			<dl>
				<dt>Description list title 01</dt>
				<dd>Description list description 01</dd>
				<dt>Description list title 02</dt>
				<dd>Description list description 02</dd>
				<dd>Description list description 03</dd>
			</dl>
			<table>
				<caption>Table Caption</caption>
				<thead>
					<tr>
						<th>Table head th</th>
						<td>Table head td</td>
					</tr>
				</thead>
				<tfoot>
					<tr>
						<th>Table foot th</th>
						<td>Table foot td</td>
					</tr>
				</tfoot>
				<tbody>
					<tr>
						<th>Table body th</th>
						<td>Table body td</td>
					</tr>
					<tr>
						<td>Table body td</td>
						<td>Table body td</td>
					</tr>
				</tbody>
			</table>
			<form action="#">
				<fieldset>
					<legend>Form legend</legend>
					<div>
						<label for="f1">Text input:</label>
						<br />
						<input type="text" id="f1" value="input text" />
					</div>
					<div>
						<label for="pw">Password input:</label>
						<br />
						<input type="password" id="pw" value="password" />
					</div>
					<div>
						<label for="f2">Radio input:</label>
						<br />
						<input type="radio" id="f2" />
					</div>
					<div>
						<label for="f3">Checkbox input:</label>
						<br />
						<input type="checkbox" id="f3" />
					</div>
					<div>
						<label for="f4">Select field:</label>
						<br />
						<select id="f4">
							<option>Option 01</option>
							<option>Option 02</option>
						</select>
					</div>
					<div>
						<label for="f5">Textarea:</label>
						<br />
						<textarea id="f5" cols={30} rows={5}>Textarea text</textarea>
					</div>
					<div>
						<label for="f6">Input Button:</label>
						<br />
						<input type="button" id="f6" value="button text" />
					</div>
					<div>
						<div>
							Button Elements:
							<span class="small quiet">
								Can use &lt;button&gt; tag or &lt;a class="button"&gt;
							</span>
						</div>
						<br />
						<button class="button primary">Primary</button>
						<button class="button secondary">Secondary</button>
						<button class="button tertiary">Tertiary</button>
						<button class="button danger">Danger</button>
					</div>
				</fieldset>
			</form>
		</section>
	</div>
</SiteTemplate>

<style>
	.intro {
		margin: 0;
		color: color-mix(in srgb, currentColor 75%, transparent);
	}

	.piko-docs-nav {
		& > li:not(:last-child) {
            margin-bottom: var(--piko-space-stack-gap);
        }
	}

	.piko-docs-nav-groups {
		display: grid;
		gap: var(--piko-space-stack-gap);
	}

	.piko-docs-nav-title {
		margin: 0 0 var(--piko-space-control-padding-y);
		font-size: var(--piko-t-caption);
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: var(--piko-color-text-subtle);
	}

	.piko-docs-nav {
		display: grid;
		gap: var(--piko-space-cluster-gap);
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: var(--piko-t-small);
	}

	.piko-docs-nav a {
		color: var(--piko-color-text);
		text-decoration: none;
	}

	.piko-docs-nav a:hover,
	.piko-docs-nav a:focus-visible {
		text-decoration: underline;
	}

	.piko-docs-section {
		margin-block: var(--piko-space-section-gap);
	}

	.piko-docs-section > section + section {
		margin-top: var(--piko-space-section-gap);
	}

	.piko-token-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(224px, 1fr));
		gap: var(--piko-space-grid-gap);
	}

	.piko-swatch-scale {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
		gap: var(--piko-space-cluster-gap);
	}

	.piko-swatch {
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		min-height: 4.5rem;
		padding: var(--piko-space-panel-padding);
		display: flex;
		align-items: flex-end;
		font-size: var(--piko-t-caption);
		color: var(--piko-palette-slate-9);
		background: var(--piko-color-surface);
	}

	.piko-swatch code {
		overflow-wrap: anywhere;
	}

	.piko-token-list {
		display: grid;
		gap: var(--piko-space-stack-gap);
	}

	.piko-token-chip {
		border: 1px solid var(--piko-color-border);
		border-radius: 0;
		padding: var(--piko-space-control-padding-y)
			var(--piko-space-control-padding-x);
		background: var(--piko-color-surface);
		font-size: var(--piko-t-small);
	}

	.piko-token-chip :where(p) {
		margin: 0;
	}

	.piko-space-table {
		width: 100%;
		border: 1px solid var(--piko-color-border);
		border-collapse: collapse;
		font-size: var(--piko-t-small);
	}

	.piko-space-table th,
	.piko-space-table td {
		border: 1px solid var(--piko-color-border);
		padding: var(--piko-space-control-padding-y)
			var(--piko-space-control-padding-x);
		text-align: left;
		vertical-align: middle;
	}

	.piko-space-table th {
		font-weight: 700;
		background: var(--piko-color-surface);
	}

	.piko-space-table td:last-child {
		min-width: 12rem;
	}

	.piko-space-bar {
		height: 1rem;
	}

	.piko-state {
		--piko-state-text: var(--piko-color-text);
		--piko-state-bg: var(--piko-color-surface);
		--piko-state-border: var(--piko-color-border);
		border-radius: 0;
	}

	.piko-state[data-state="success"] {
		--piko-state-text: var(--piko-color-success-text);
		--piko-state-bg: var(--piko-color-success-bg);
		--piko-state-border: var(--piko-color-success-border);
	}

	.piko-state[data-state="warning"] {
		--piko-state-text: var(--piko-color-warning-text);
		--piko-state-bg: var(--piko-color-warning-bg);
		--piko-state-border: var(--piko-color-warning-border);
	}

	.piko-state[data-state="error"] {
		--piko-state-text: var(--piko-color-error-text);
		--piko-state-bg: var(--piko-color-error-bg);
		--piko-state-border: var(--piko-color-error-border);
	}

	.piko-state--box {
		background: var(--piko-state-bg);
		border: 1px solid var(--piko-state-border);
		color: var(--piko-state-text);
		padding: var(--piko-space-panel-padding);
	}

	.piko-state--text {
		color: var(--piko-state-text);
		font-size: var(--piko-t-small);
		font-weight: 600;
		padding: 0;
	}

	.piko-form-demo {
		display: grid;
		gap: var(--piko-space-stack-gap);
	}

	.piko-form-field {
		display: grid;
		gap: var(--piko-unit-quarter);
	}

	.piko-form-hint {
		margin: 0;
		font-size: var(--piko-t-small);
		color: var(--piko-color-text-subtle);
	}

	.piko-fieldset {
		border: 1px solid var(--piko-color-border);
		padding: var(--piko-space-panel-padding);
		margin: 0;
		display: grid;
		gap: var(--piko-space-stack-gap);
	}

	.piko-fieldset legend {
		font-weight: 700;
		padding-inline: var(--piko-unit-quarter);
	}

	.piko-check-group {
		display: grid;
		gap: var(--piko-space-cluster-gap);
	}

	.piko-check-item {
		display: flex;
		align-items: baseline;
		gap: var(--piko-unit-half);
	}

	.piko-check-item input[type="checkbox"],
	.piko-check-item input[type="radio"] {
		flex-shrink: 0;
	}

	.piko-form-actions {
		display: flex;
		gap: var(--piko-space-cluster-gap);
		flex-wrap: wrap;
	}
</style>
