"use client";

import { useFormStatus } from "react-dom";

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

	return (
		<button
			type="submit"
			className={className}
			disabled={pending}
			onClick={(event) => {
				if (pending) {
					return;
				}
				if (!window.confirm(confirmMessage)) {
					event.preventDefault();
				}
			}}
		>
			{pending ? "Working..." : label}
		</button>
	);
}
