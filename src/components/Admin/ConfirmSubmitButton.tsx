"use client";

import { useFormStatus } from "react-dom";
import type { MouseEvent } from "react";

interface ConfirmSubmitButtonProps {
	label: string;
	confirmMessage: string;
	className?: string;
}

export default function ConfirmSubmitButton({
	label,
	confirmMessage,
	className,
}: ConfirmSubmitButtonProps) {
	const { pending } = useFormStatus();

	function handleClick(event: MouseEvent<HTMLButtonElement>) {
		if (pending) {
			return;
		}
		if (!window.confirm(confirmMessage)) {
			event.preventDefault();
		}
	}

	return (
		<button
			type="submit"
			className={className}
			disabled={pending}
			onClick={handleClick}
		>
			{pending ? "Working..." : label}
		</button>
	);
}
