<script lang="ts">
    import {onMount} from "svelte";

    export let message: string = "Delete this item?";
  export let hiddenName: string = "id";
  export let hiddenValue: string | null = null;
  export let actionPath: string = "?/delete";
  export let disabled = false;

  // trigger button props
  export let buttonLabel: string = "Delete";
  export let buttonTitle: string | null = null;
  export let buttonDisabled: boolean = false;

  // callback props instead of createEventDispatcher
  export let onCancel: (() => void) | null = null;
  export let onSubmit: (() => void) | null = null;
  export let onClose: (() => void) | null = null;

  let dialog: HTMLDialogElement | null = null;

  function openDialog() {
    if (buttonDisabled) return;
    dialog?.showModal();
  }

  function handleCancel() {
    onCancel?.();
    dialog?.close();
  }

  function handleSubmit() {
    onSubmit?.();
    // close after submit to keep UI consistent; navigation may occur
    dialog?.close();
  }

  onMount(() => {
    const onCloseInternal = () => {
      onClose?.();
    };
    dialog?.addEventListener("close", onCloseInternal);
    return () => dialog?.removeEventListener("close", onCloseInternal);
  });
</script>

<button
  type="button"
  class="piko-button--danger"
  title={buttonTitle}
  disabled={buttonDisabled || disabled}
  on:click={openDialog}
>
  {buttonLabel}
</button>

<dialog bind:this={dialog} on:cancel|preventDefault={handleCancel}>
  <form method="post" action={actionPath} on:submit={handleSubmit}>
    <p>{message}</p>
    <input type="hidden" name={hiddenName} value={hiddenValue ?? ""} />

    <div class="dialog-actions">
      <button type="submit" class="piko-button--danger" disabled={disabled}>Yes, Delete</button>
      <button type="button" class="piko-button" on:click={handleCancel} disabled={disabled}>Cancel</button>
    </div>
  </form>
</dialog>

<style>
  .dialog-actions {
    display: flex;
    gap: 0.5rem;
    justify-content: flex-end;
    margin-top: 1rem;
  }
</style>
