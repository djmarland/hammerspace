import PikoToken from "@/components/PikoToken";

export default async function Page() {
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
	const semanticColors = [
		"--piko-color-background",
		"--piko-color-surface",
		"--piko-color-text",
		"--piko-color-text-muted",
		"--piko-color-border",
		"--piko-color-link",
		"--piko-color-primary-bg",
		"--piko-color-success-bg",
		"--piko-color-warning-bg",
		"--piko-color-error-bg",
	] as const;
	const typographyTokens = [
		"--piko-type-h1",
		"--piko-type-h2",
		"--piko-type-h3",
		"--piko-type-h4",
		"--piko-type-h5",
		"--piko-type-h6",
		"--piko-type-lead",
		"--piko-type-body",
		"--piko-type-small",
		"--piko-type-caption",
	] as const;
	const coreSpacingTokens = [
		{ label: "Unit", token: "--piko-unit" },
		{ label: "Quarter unit", token: "--piko-unit-quarter" },
		{ label: "Half unit", token: "--piko-unit-half" },
		{ label: "Three-quarter unit", token: "--piko-unit-three-quarter" },
		{ label: "Double unit", token: "--piko-unit-double" },
		{ label: "Triple unit", token: "--piko-unit-triple" },
		{ label: "Quad unit", token: "--piko-unit-quad" },
	] as const;
	const semanticSpacingTokens = [
		{ label: "Grid gap", token: "--piko-space-grid-gap" },
		{ label: "Stack gap", token: "--piko-space-stack-gap" },
		{ label: "Cluster gap", token: "--piko-space-cluster-gap" },
		{ label: "Section gap", token: "--piko-space-section-gap" },
		{ label: "Card padding", token: "--piko-space-card-padding" },
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
			title: "Reference",
			sections: [{ id: "html-kitchen-sink", label: "HTML Kitchen Sink" }],
		},
	] as const;

	return (
		<div className="container">
			<h1 className="piko-type-h1">Piko</h1>
			<p>Piko is the design system for Hammerspace</p>

			<div className="piko-docs-layout">
				<aside className="piko-docs-sidebar" aria-label="Section navigation">
					<nav>
						<div className="piko-docs-nav-groups">
							{docsNavGroups.map((group) => (
								<div className="piko-docs-nav-group" key={group.title}>
									<p className="piko-docs-nav-title">{group.title}</p>
									<ul className="piko-docs-nav">
										{group.sections.map((section) => (
											<li key={section.id}>
												<a href={`#${section.id}`}>{section.label}</a>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</nav>
				</aside>

				<div className="piko-docs-content">
					<section className="piko-docs-section piko-prose" id="core">
						<h2>Core</h2>
						<section id="core-colours">
							<h3>Colours</h3>
						<p>
							Core ramps are colour-name based and semantic roles map onto those
							ramps.
						</p>
						<div className="piko-token-grid">
							{corePalettes.map((palette) => (
								<div key={palette.token}>
									<p>
										<strong>{palette.label}</strong>
									</p>
									<div className="piko-swatch-scale">
										{paletteSteps.map((step) => {
											const paletteToken = `--piko-palette-${palette.token}-${step}`;
											return (
												<div
													key={`${palette.token}-${step}`}
													className="piko-swatch"
													style={{
														backgroundColor: `var(${paletteToken})`,
														color: `contrast-color(var(${paletteToken}))`,
													}}
												>
													<PikoToken token={paletteToken} />
												</div>
											);
										})}
									</div>
								</div>
							))}
						</div>
						</section>
						<section id="core-spacing">
							<h3>Spacing units</h3>
							<table className="piko-space-table">
								<thead>
									<tr>
										<th>Label</th>
										<th>Token</th>
										<th>Preview</th>
									</tr>
								</thead>
								<tbody>
									{coreSpacingTokens.map(({ label, token }) => (
										<tr key={token}>
											<td>{label}</td>
											<td>
												<PikoToken token={token} />
											</td>
											<td>
												<div
													className="piko-space-bar"
													style={{ width: `max(var(${token}), 0.125rem)` }}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</section>
					</section>

					<section className="piko-docs-section piko-prose" id="semantic">
						<h2>Semantic</h2>
						<section id="semantic-colours">
							<h3>Colours</h3>
							<div className="piko-token-grid">
								{semanticColors.map((token) => (
									<div className="piko-token-chip" key={token}>
										<div
											className="piko-swatch"
											style={{
												backgroundColor: `var(${token})`,
											}}
										/>
										<PikoToken token={token} />
									</div>
								))}
							</div>
						</section>
						<section id="semantic-typography">
							<h3>Typography</h3>
							<div className="piko-token-list">
								{typographyTokens.map((token) => (
									<div className="piko-token-chip" key={token}>
										<p style={{ fontSize: `var(${token})` }}>
											The quick brown fox jumps over the lazy dog.
										</p>
										<PikoToken token={token} />
									</div>
								))}
							</div>
						</section>
						<section id="semantic-spacing">
							<h3>Spacing roles</h3>
							<table className="piko-space-table">
								<thead>
									<tr>
										<th>Label</th>
										<th>Token</th>
										<th>Preview</th>
									</tr>
								</thead>
								<tbody>
									{semanticSpacingTokens.map(({ label, token }) => (
										<tr key={token}>
											<td>{label}</td>
											<td>
												<PikoToken token={token} />
											</td>
											<td>
												<div
													className="piko-space-bar"
													style={{ width: `max(var(${token}), 0.125rem)` }}
												/>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</section>
						<section id="semantic-states">
							<h3>States</h3>
						<div className="piko-token-list">
							{states.map((state) => (
								<div key={state}>
									<p className="piko-state piko-state--box" data-state={state}>
										<strong>{state}</strong>: boxed mode using{" "}
										<PikoToken token={`data-state="${state}"`} />
									</p>
									<p className="piko-state piko-state--text" data-state={state}>
										{state} text mode using{" "}
										<PikoToken token=".piko-state--text" />
									</p>
								</div>
							))}
						</div>
						</section>
					</section>

					<section className="piko-docs-section piko-prose" id="html-kitchen-sink">
						<h2>HTML Kitchen Sink</h2>
						<p>
							The rest of this page demonstrates the default styles for all the
							HTML elements. Adapted from{" "}
							<a href="https://github.com/ericrasch/html-kitchen-sink/tree/master">
								ericrasch/html-kitchen-sink
							</a>
							.
						</p>
						<h1>
							This is the primary heading and there should only be one of these
							per page
						</h1>
						<p>
							A small paragraph to <em>emphasis</em> and show{" "}
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
									<li>
										Lorem ipsum dolor sit amet, consectetuer adipiscing elit.
									</li>
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
							Pellentesque habitant morbi tristique senectus et netus et
							malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
							vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
							amet quam egestas semper. Aenean ultricies mi vitae est. Mauris
							placerat eleifend leo.
						</p>
						<table summary="Top 10 downloaded movies in 2011 using BitTorrent, in descending order, listing number of downloads and worldwide cinema grosses">
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
									<th colSpan={4}>torrentfreak.com</th>
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
							A sub heading which is not as important as the second, but should
							be used with consideration
						</h3>
						<p>
							Pellentesque habitant morbi tristique senectus et netus et
							malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
							vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
							amet quam egestas semper. Aenean ultricies mi vitae est. Mauris
							placerat eleifend leo.
						</p>
						<blockquote>
							<p>
								<em>This is a properly formatted blockquote, btw.</em> Measuring
								programming progress by lines of code is like measuring aircraft
								building progress by weight.
							</p>
							<footer>
								—{" "}
								<cite>
									<a href="https://www.thegatesnotes.com">Bill Gates</a>
								</cite>
							</footer>
						</blockquote>
						<h4>
							A sub heading which is not as important as the second, but should
							be used with consideration
						</h4>
						<p>
							Pellentesque habitant morbi tristique senectus et netus et
							malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
							vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
							amet quam egestas semper. Aenean ultricies mi vitae est. Mauris
							placerat eleifend leo.
						</p>
						<blockquote>
							<p>
								“Ooh - a blockquote! Lorem ipsum dolor sit amet, consectetur
								adipiscing elit. Vivamus magna. Cras in mi at felis aliquet
								congue. Ut a est eget ligula molestie gravida. Curabitur massa.
								Donec eleifend, libero at sagittis mollis, tellus est malesuada
								tellus, at luctus turpis elit sit amet quam. Vivamus pretium
								ornare est.”
							</p>
						</blockquote>
						<pre>
							<code>{`
					#header h1 a {
						display: block; 
						width: 300px;
					 	height: 80px;
					}
					`}</code>
						</pre>
						<h5>
							A sub heading which is not as important as the second, but should
							be used with consideration
						</h5>
						<p>
							Pellentesque habitant morbi tristique senectus et netus et
							malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
							vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
							amet quam egestas semper. Aenean ultricies mi vitae est. Mauris
							placerat eleifend leo.
						</p>
						<dl>
							<dt>Definition list</dt>
							<dd>
								Consectetur adipisicing elit, sed do eiusmod tempor incididunt
								ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
								nostrud exercitation ullamco laboris nisi ut aliquip ex ea
								commodo consequat.
							</dd>
							<dt>Lorem ipsum dolor sit amet</dt>
							<dd>
								Consectetur adipisicing elit, sed do eiusmod tempor incididunt
								ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis
								nostrud exercitation ullamco laboris nisi ut aliquip ex ea
								commodo consequat.
							</dd>
						</dl>
						<h6>
							This heading plays a relatively small bit part role, if you use it
							at all
						</h6>
						<p>
							Pellentesque habitant morbi tristique senectus et netus et
							malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat
							vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit
							amet quam egestas semper. Aenean ultricies mi vitae est. Mauris
							placerat eleifend leo.
						</p>
						<h1>Level 1 heading</h1>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h1 className="fancy">Level 1 heading class="fancy"</h1>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h1 className="thin">Level 1 heading class="thin"</h1>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h1 className="caps">Level 1 heading class="caps"</h1>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h2>Level 02 Heading</h2>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h2 className="fancy">Level 2 heading class="fancy"</h2>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h2 className="thin">Level 2 heading class="thin"</h2>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h2 className="caps">Level 2 heading class="caps"</h2>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h3>Level 03 Heading</h3>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h3 className="fancy">Level 3 heading class="fancy"</h3>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h3 className="thin">Level 3 heading class="thin"</h3>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h3 className="caps">Level 3 heading class="caps"</h3>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h4>Level 04 Heading</h4>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h4 className="fancy">Level 4 heading class="fancy"</h4>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h4 className="thin">Level 4 heading class="thin"</h4>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h4 className="caps">Level 4 heading class="caps"</h4>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h5>Level 05 Heading</h5>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h5 className="fancy">Level 5 heading class="fancy"</h5>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h5 className="thin">Level 5 heading class="thin"</h5>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h5 className="caps">Level 5 heading class="caps"</h5>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h6>Level 06 Heading</h6>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h6 className="fancy">Level 6 heading class="fancy"</h6>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h6 className="thin">Level 6 heading class="thin"</h6>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<h6 className="caps">Level 6 heading class="caps"</h6>
						<p>
							Sed scelerisque sagittis lorem. Phasellus sodales. Nulla urna
							justo, vehicula in, suscipit nec, molestie sed, tellus.
						</p>
						<blockquote>
							<p>
								Paragraph inside Blockquote: Nam libero leo, elementum in,
								dapibus a, suscipit vitae, purus. Duis arcu. Integer dignissim
								fermentum enim. Morbi convallis felis vel nibh. Sed scelerisque
								sagittis lorem.
							</p>
						</blockquote>
						<address>Address: Example address 224, Sweden</address>
						<pre>
							<strong>Preformated:</strong>Testing one row and another
						</pre>
						<p>
							I am <a href="?abc123">the a tag</a> example
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
							<br />I am the <span className="small">small class</span> example
							<br />I am the <span className="large">large class</span> example
							<br />I am the <span className="quiet">quiet class</span> example
							<br />I am the <span className="highlight">
								highlight class
							</span>{" "}
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
									<label htmlFor="f1">Text input:</label>
									<br />
									<input type="text" id="f1" defaultValue="input text" />
								</div>
								<div>
									<label htmlFor="pw">Password input:</label>
									<br />
									<input type="password" id="pw" defaultValue="password" />
								</div>
								<div>
									<label htmlFor="f2">Radio input:</label>
									<br />
									<input type="radio" id="f2" />
								</div>
								<div>
									<label htmlFor="f3">Checkbox input:</label>
									<br />
									<input type="checkbox" id="f3" />
								</div>
								<div>
									<label htmlFor="f4">Select field:</label>
									<br />
									<select id="f4">
										<option>Option 01</option>
										<option>Option 02</option>
									</select>
								</div>
								<div>
									<label htmlFor="f5">Textarea:</label>
									<br />
									<textarea
										id="f5"
										cols={30}
										rows={5}
										defaultValue="Textarea text"
									/>
								</div>
								<div>
									<label htmlFor="f6">Input Button:</label>
									<br />
									<input type="button" id="f6" defaultValue="button text" />
								</div>
								<div>
									<label>
										Button Elements:{" "}
										<span className="small quiet">
											Can use &lt;button&gt; tag or &lt;a class="button"&gt;
										</span>
									</label>
									<br />
									<button className="button primary">Primary</button>{" "}
									<a className="button secondary" href="#">
										Secondary
									</a>{" "}
									<a href="#" className="button tertiary">
										Tertiary
									</a>{" "}
									<a href="#" className="button danger">
										Danger
									</a>
								</div>
							</fieldset>
						</form>
					</section>
				</div>
			</div>
		</div>
	);
}
