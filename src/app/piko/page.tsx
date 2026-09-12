import type { Metadata } from "next";
import { Fragment } from "react";
import ComputedCssValue from "@/components/ComputedCssValue";
import PikoToken from "@/components/PikoToken";
import SidePageHeader from "@/components/Blog/SidePageHeader";
import SiteTemplate from "@/components/Templates/SiteTemplate/SiteTemplate";
import FormField from "@/components/Molecules/FormField/FormField";
import HueControl from "./HueControl";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "Piko",
};

const corePalettes = [
	{ label: "Dynamic", token: "dynamic" },
	{ label: "Grey", token: "grey" },
	{ label: "Red", token: "red" },
	{ label: "Orange", token: "orange" },
	{ label: "Yellow", token: "yellow" },
	{ label: "Green", token: "green" },
	{ label: "Teal", token: "teal" },
	{ label: "Blue", token: "blue" },
	{ label: "Purple", token: "purple" },
	{ label: "Pink", token: "pink" },
] as const;

const paletteSteps = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const;

const fontSizeTokens = [
	"--piko-fontsize--2",
	"--piko-fontsize--1",
	"--piko-fontsize-0",
	"--piko-fontsize-1",
	"--piko-fontsize-2",
	"--piko-fontsize-3",
	"--piko-fontsize-4",
	"--piko-fontsize-5",
] as const;

const semanticColors = {
	Text: [
		"--piko-color-text",
		"--piko-color-text-subtle",
		"--piko-color-text-dynamic",
	],
	Backgrounds: [
		"--piko-color-background",
		"--piko-color-background-secondary",
		"--piko-color-background-inactive",
		"--piko-color-background-dynamic",
	],

	Links: [
		"--piko-color-link",
		"--piko-color-link-visited",
		"--piko-color-link-hover",
	],

	Borders: [
		"--piko-color-border",
		"--piko-color-border-subtle",
		"--piko-color-border-strong",
	],
	Other: ["--piko-color-accent"],
} as const;

const typographyClasses = [
	"piko-t-h1",
	"piko-t-h2",
	"piko-t-h3",
	"piko-t-h4",
	"piko-t-h5",
	"piko-t-h6",
	"piko-t-body",
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
	{ label: "Text gap", token: "--piko-gap-text" },
	{ label: "Panel padding", token: "--piko-space-panel-padding" },
	{ label: "Control padding (x)", token: "--piko-space-control-padding-x" },
	{ label: "Control padding (y)", token: "--piko-space-control-padding-y" },
] as const;

const states = ["info", "success", "warning", "error"] as const;

const docsNavGroups = [
	{
		title: "Core",
		id: "core",
		sections: [
			{ id: "core-colours", label: "Colours" },
			{ id: "core-spacing", label: "Spacing Units" },
			{ id: "core-font", label: "Font" },
		],
	},
	{
		title: "Semantic",
		id: "semantic",
		sections: [
			{ id: "semantic-colours", label: "Colours" },
			{ id: "semantic-typography", label: "Typography" },
			{ id: "semantic-spacing", label: "Spacing Roles" },
			{ id: "semantic-states", label: "States" },
		],
	},
	{
		title: "Components",
		id: "components",
		sections: [
			{ id: "buttons", label: "Buttons" },
			{ id: "form-elements", label: "Form elements" },
		],
	},
	{
		title: "Reference",
		id: undefined,
		sections: [{ id: "html-kitchen-sink", label: "HTML Kitchen Sink" }],
	},
] as const;

export default function PikoPage() {
	return (
		<SiteTemplate
			header={
				<SidePageHeader title="Piko">
					<p>Piko is the design system for Hammerspace</p>
					<nav>
						<ul className="piko-vstack">
							{docsNavGroups.map((group) => (
								<li key={group.title}>
									{/* id is optional, so it should only be a link if it exists */}
									<p className={`piko-t-group-label ${styles.navGroupLabel}`}>
										{group.id ? (
											<a href={`#${group.id}`}>{group.title}</a>
										) : (
											group.title
										)}
									</p>
									<ul className={styles.navGroupItems}>
										{group.sections.map((section) => (
											<li key={section.id}>
												<a href={`#${section.id}`}>{section.label}</a>
											</li>
										))}
									</ul>
								</li>
							))}
						</ul>
					</nav>
				</SidePageHeader>
			}
		>
			<div className="piko-prose">
				<section className="piko-prose__block" id="core">
					<h2>Core</h2>
					<p>
						The Core section sets up CSS custom properties for core design
						tokens, used throughout the design system. They aren&apos;t often
						used directly in components, but are the foundation for semantic
						tokens and component styles.
					</p>
					<section id="core-colours" className="piko-prose__block">
						<h3>Colour Palette</h3>
						<p>
							The base colours used in the design system. These are used to
							generate semantic colours for components and states. Dynamic is a
							special palette that is generated from today&apos;s hue.
						</p>
						<HueControl />
						<div className={styles.tokenGrid}>
							{corePalettes.map((palette) => (
								<div key={palette.token}>
									<h4>{palette.label}</h4>
									<div className="piko-vstack--small">
										{paletteSteps.map((step) => {
											const paletteToken = `--piko-palette-${palette.token}-${step}`;
											return (
												<div
													key={paletteToken}
													className={styles.swatch}
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
						<h3>Spacing Units</h3>
						<table>
							<thead>
								<tr>
									<th>Label</th>
									<th>Token</th>
									<th>Value</th>
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
											<code>
												<ComputedCssValue propertyName={token} />
											</code>
										</td>
										<td>
											<div
												className={styles.spaceBar}
												style={{ width: `max(var(${token}), 0.125rem)` }}
											></div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
					<section id="core-font">
						<h3>Font</h3>
						<p>
							The text scaling system comes from{" "}
							<a
								href="https://utopia.fyi/type/calculator?c=360,16,1.2,1240,20,1.25,5,2,&s=0.75|0.5|0.25,1.5|2|3|4|6,s-l&g=s,l,xl,12"
								target="_blank"
								rel="noopener noreferrer"
							>
								Utopia
							</a>{" "}
							making it dyanmic at different viewports sizes.
						</p>
						<table>
							<thead>
								<tr>
									<th>Token</th>
									<th>Example</th>
								</tr>
							</thead>
							<tbody>
								{fontSizeTokens.map((token) => (
									<tr key={token}>
										<td style={{ width: "40%" }}>
											<PikoToken token={token} />
										</td>
										<td style={{ fontSize: `var(${token})` }}>
											The quick brown fox jumps over the lazy dog.
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
				</section>

				<section className="piko-docs-section piko-prose" id="semantic">
					<h2>Semantic</h2>

					<p>
						Semantic tokens and classes are the implementable versions of the
						core design tokens. They take into account dark/light mode and are
						about the intended <em>use</em> of the token rather than its raw
						value. Core tokens generally never change their value, but semantic
						tokens may - and that change will cascade through the website.
					</p>

					<section id="semantic-colours">
						<h3>Colours</h3>
						<p>
							These are colours with meaning, so should always be used instead
							of the core palette tokens.
						</p>
						<div className="piko-vstack">
							{Object.entries(semanticColors).map(([group, tokens]) => (
								<div key={group}>
									<h4>{group}</h4>
									<div className={styles.tokenGrid}>
										{tokens.map((token) => (
											<div
												key={token}
												className={styles.swatch}
												style={{
													backgroundColor: `var(${token})`,
													color: `contrast-color(var(${token}))`,
												}}
											>
												<PikoToken token={token} />
											</div>
										))}
									</div>
								</div>
							))}
						</div>
					</section>
					<section id="semantic-typography">
						<h3>Typography</h3>
						<p>
							These are classes to use for typography, which will apply the
							appropriate font-size, line-height, font-weight and
							letter-spacing.
						</p>
						<table>
							<thead>
								<tr>
									<th>Classname</th>
									<th>Size Token</th>
									<th>Example</th>
								</tr>
							</thead>
							<tbody>
								{typographyClasses.map((token) => (
									<tr key={token}>
										<td>
											<PikoToken token={`.${token}`} />
										</td>
										<td>
											<PikoToken token={`--${token}`} />
										</td>
										<td className={token}>
											The quick brown fox jumps over the lazy dog.
										</td>
									</tr>
								))}
							</tbody>
						</table>
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
												className={styles.spaceBar}
												style={{ width: `max(var(${token}), 0.125rem)` }}
											></div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</section>
					<section id="semantic-states">
						<h3>States</h3>
						<div className="piko-vstack">
							{states.map((state) => (
								<Fragment key={state}>
									<div>
										<h4 className="piko-t-h5">
											<PikoToken token={`data-state="${state}"`} />
										</h4>
										<div className="piko-vstack--small" data-state={state}>
											<p className="piko-state__text">
												{state} text mode using{" "}
												<PikoToken token=".piko-state__text" />
											</p>
											<p className="piko-state__box">
												<strong>{state}</strong>: boxed mode using{" "}
												<PikoToken token=".piko-state__box" />
											</p>
										</div>
									</div>
									<hr />
								</Fragment>
							))}
						</div>
					</section>
				</section>

				<section className="piko-docs-section" id="components">
					<section id="buttons">
						<h2>Buttons</h2>

						<p>
							<button>Default Button (secondary)</button>
						</p>
						<p>
							<button className="piko-button--primary">Primary Button</button>
						</p>
						<p>
							<button className="piko-button--tertiary">Tertiary Button</button>
						</p>
						<p>
							<button className="piko-button--danger">Danger Button</button>
						</p>
					</section>

					<section className="piko-docs-section piko-prose" id="form-elements">
						<h2>Form elements</h2>
						<p>
							Examples of common form controls with labels, fieldsets, and
							various states.
						</p>

						<section id="form-text-inputs">
							<h3>Text inputs</h3>
							<FormField id="demo-text" label="Full name">
								<input
									type="text"
									id="demo-text"
									placeholder="e.g. Jane Smith"
								/>
							</FormField>
							<FormField id="demo-email" label="Email address">
								<input
									type="email"
									id="demo-email"
									placeholder="you@example.com"
								/>
							</FormField>
							<FormField id="demo-password" label="Password">
								<input
									type="password"
									id="demo-password"
									placeholder="••••••••"
								/>
							</FormField>
							<FormField id="demo-number" label="Quantity">
								<input
									type="number"
									id="demo-number"
									defaultValue={1}
									min={1}
									max={99}
								/>
							</FormField>
						</section>

						<section id="form-helper-error">
							<h3>With helper text and errors</h3>
							<FormField
								id="demo-hint"
								required
								label="Username"
								hint="Must be 3–20 characters. Letters, numbers, and underscores only."
							>
								<input
									type="text"
									id="demo-hint"
									aria-describedby="demo-hint-description"
									defaultValue="jane_smith"
								/>
							</FormField>
							<FormField
								id="email"
								required
								label="Email address"
								hint="Must be valid."
								stateMessage="Enter a valid email address."
								state="error"
							>
								<input
									type="text"
									id="email"
									aria-describedby="email-description"
									defaultValue="jane_smith"
								/>
							</FormField>
						</section>

						<section id="form-disabled">
							<h3>Disabled state</h3>
							<FormField id="demo-disabled" label="Account ID">
								<input type="text" defaultValue="ACC-00042" disabled />
							</FormField>
							<FormField id="demo-disabled-select" label="Region">
								<select id="demo-disabled-select" disabled>
									<option>Europe (EU-West)</option>
								</select>
							</FormField>
						</section>

						<section id="form-select-textarea">
							<h3>Select and textarea</h3>
							<FormField id="demo-select" label="Country">
								<select id="demo-select">
									<option value="">Choose a country…</option>
									<option value="gb">United Kingdom</option>
									<option value="us">United States</option>
									<option value="de">Germany</option>
									<option value="fr">France</option>
								</select>
							</FormField>
							<FormField
								id="demo-textarea"
								label="Message"
								hint="Max 500 characters."
							>
								<textarea
									id="demo-textarea"
									rows={4}
									aria-describedby="demo-textarea-description"
									placeholder="Write your message here…"
								></textarea>
							</FormField>
						</section>

						<section id="form-checkboxes">
							<h3>Checkboxes</h3>
							<fieldset className="piko-fieldset">
								<legend>Notification preferences</legend>
								<p className="piko-form-hint">
									Choose which emails you&apos;d like to receive.
								</p>
								<div className="piko-check-group">
									<div className="piko-check-item">
										<input type="checkbox" id="cb-product" defaultChecked />
										<label htmlFor="cb-product">Product updates</label>
									</div>
									<div className="piko-check-item">
										<input type="checkbox" id="cb-security" defaultChecked />
										<label htmlFor="cb-security">Security alerts</label>
									</div>
									<div className="piko-check-item">
										<input type="checkbox" id="cb-newsletter" />
										<label htmlFor="cb-newsletter">Newsletter</label>
									</div>
									<div className="piko-check-item">
										<input type="checkbox" id="cb-disabled" disabled />
										<label htmlFor="cb-disabled">
											Promotional offers (unavailable)
										</label>
									</div>
								</div>
							</fieldset>
						</section>

						<section id="form-radios">
							<h3>Radio buttons</h3>
							<fieldset className="piko-fieldset">
								<legend>Billing cycle</legend>
								<p className="piko-form-hint">
									Select how often you&apos;d like to be billed.
								</p>
								<div className="piko-check-group">
									<div className="piko-check-item">
										<input
											type="radio"
											name="billing"
											id="r-monthly"
											value="monthly"
											defaultChecked
										/>
										<label htmlFor="r-monthly">Monthly</label>
									</div>
									<div className="piko-check-item">
										<input
											type="radio"
											name="billing"
											id="r-annual"
											value="annual"
										/>
										<label htmlFor="r-annual">
											Annual <span className="small quiet">(save 20%)</span>
										</label>
									</div>
									<div className="piko-check-item">
										<input
											type="radio"
											name="billing"
											id="r-disabled"
											value="lifetime"
											disabled
										/>
										<label htmlFor="r-disabled">Lifetime (coming soon)</label>
									</div>
								</div>
							</fieldset>
						</section>

						<section id="form-full-example">
							<h3>Full form example</h3>
							<form className="piko-form-demo" action="#">
								<fieldset className="piko-fieldset">
									<legend>Account details</legend>
									<div className="piko-form-field">
										<label htmlFor="full-name">Full name</label>
										<input type="text" id="full-name" autoComplete="name" />
									</div>
									<div className="piko-form-field">
										<label htmlFor="full-email">Email address</label>
										<input type="email" id="full-email" autoComplete="email" />
									</div>
								</fieldset>
								<fieldset className="piko-fieldset">
									<legend>Communication preferences</legend>
									<div className="piko-check-group">
										<div className="piko-check-item">
											<input type="checkbox" id="full-cb-1" />
											<label htmlFor="full-cb-1">
												Email me about new features
											</label>
										</div>
										<div className="piko-check-item">
											<input type="checkbox" id="full-cb-2" defaultChecked />
											<label htmlFor="full-cb-2">Send me security alerts</label>
										</div>
									</div>
								</fieldset>
								<div className="piko-form-actions">
									<button type="submit" className="button primary">
										Save changes
									</button>
									<button type="reset" className="button secondary">
										Cancel
									</button>
								</div>
							</form>
						</section>
					</section>
				</section>

				<section className="piko-docs-section" id="html-kitchen-sink">
					<h2>HTML Kitchen Sink</h2>
					<p>
						The rest of this page demonstrates the default styles for all the
						HTML elements. Adapted from{" "}
						<a href="https://github.com/ericrasch/html-kitchen-sink/tree/master">
							ericrasch/html-kitchen-sink
						</a>
						.
					</p>
					<p>
						A small paragraph to have <em>emphasis</em> and show{" "}
						<strong>important</strong> bits.
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
					<dl>
						<dt>Definition list term</dt>
						<dd>
							Defintion List Description. A definition list is perfect for
							defining terms, and is a great way to display metadata.
						</dd>
						<dt>Lorem ipsum dolor sit amet</dt>
						<dd>
							Consectetur adipisicing elit, sed do eiusmod tempor incididunt ut
							labore et dolore magna aliqua. Ut enim ad minim veniam, quis
							nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
							consequat.
						</dd>
					</dl>
					<address>Address: Example address 224, Sweden</address>
					<pre>
						<strong>Preformatted:</strong>Testing one row and another
					</pre>
					<p>
						I am <a href="/piko?abc123">the a tag</a> example
						<br />I am <abbr title="test">the abbr tag</abbr> example
						<br />I am <cite>the cite tag</cite> example
						<br />I am <code>the code tag</code> example
						<br />I am <del>the del tag</del>
						example
						<br />I am <dfn>the dfn tag</dfn> example
						<br />I am <em>the em tag</em> example
						<br />I am <i>the i tag</i> example
						<br />I am <ins>the ins tag</ins>
						example
						<br />I am <kbd>the kbd tag</kbd> example
						<br />I am <q>the q tag</q> example
						<br />I am <samp>the samp tag</samp> example
						<br />I am <small>the small tag</small> example
						<br />I am <span>the span tag</span> example
						<br />I am <strong>the strong tag</strong> example
						<br />I am <sub>the sub tag</sub> example
						<br />I am <sup>the sup tag</sup> example
						<br />I am <var>the var tag</var> example
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
						</fieldset>
					</form>
				</section>
			</div>
		</SiteTemplate>
	);
}
