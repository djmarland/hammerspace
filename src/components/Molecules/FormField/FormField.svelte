<script lang="ts">

    interface Props {
        id: string;
        state?: App.State;
        label: string;
        required?: boolean;
        hint?: string;
        stateMessage?: string;
    }

    const {id, state, label, required, hint, stateMessage}: Props = $props();
</script>


<div class="piko-form-field form-field" data-state="{state}">
    <label for="{id}">
        <span class="form-field__label piko-t-label">{label}
            {#if required}<sup class="form-field__required">* Required</sup>{/if}</span>
    </label>
    {#if hint}
        <div class="form-field__hint">{hint}</div>
    {/if}
    <div class="form-field__input">
    <slot/>
    </div>
    {#if stateMessage}
        <div class="form-field__state-message piko-state__text">{stateMessage}</div>
    {/if}
</div>

<style>

	.form-field__label {
		display: block;
	}

    .form-field__input {
        margin-top: var(--piko-unit-half);
    }

    .form-field__required {
        color: var(--piko-color-state-error-text);
      font-variant-caps: small-caps;
      font-size: var(--piko-fontsize--2);
    }

	.form-field__hint {
		font-size: var(--piko-t-small);
		color: var(--piko-color-text-subtle);
	}

	.form-field__state-message {
        margin-top: var(--piko-unit-quarter);
		font-size: var(--piko-t-body-small);
		font-weight: bold;
	}
</style>
