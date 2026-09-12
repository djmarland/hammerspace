import type { ReactNode } from "react";
import { cx } from "@/components/cx";
import styles from "./FormField.module.css";

export type FormFieldState = "error" | "success" | "warning" | "info";

interface FormFieldProps {
	id: string;
	state?: FormFieldState;
	label: string;
	required?: boolean;
	hint?: string;
	stateMessage?: string;
	children?: ReactNode;
}

export default function FormField({
	id,
	state,
	label,
	required,
	hint,
	stateMessage,
	children,
}: FormFieldProps) {
	return (
		<div className={cx("piko-form-field", styles.formField)} data-state={state}>
			<label htmlFor={id}>
				<span className={cx(styles.formField__label, "piko-t-label")}>
					{label}
					{required && (
						<sup className={styles.formField__required}>* Required</sup>
					)}
				</span>
			</label>
			{hint && <div className={styles.formField__hint}>{hint}</div>}
			<div className={styles.formField__input}>{children}</div>
			{stateMessage && (
				<div className={cx(styles.formField__stateMessage, "piko-state__text")}>
					{stateMessage}
				</div>
			)}
		</div>
	);
}
