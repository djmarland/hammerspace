import { FC, HTMLAttributes } from "react";

export const PublicationDate: FC<
	{ date: Date | null | undefined } & HTMLAttributes<HTMLElement>
> = ({ date, ...rest }) => {
	if (!date) {
		return <span {...rest}>Unpublished</span>;
	}
	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
	});
	return (
		<time dateTime={date.toISOString()} {...rest}>
			{dateFormatter.format(date)}
		</time>
	);
};
