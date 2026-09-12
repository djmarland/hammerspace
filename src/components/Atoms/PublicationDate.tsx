import { FC } from "react";

export const PublicationDate: FC<
	{ date: string | undefined } & HTMLElement
> = ({ date, ...rest }) => {
	if (!date) {
		return <span {...rest}>Unpublished</span>;
	}
	const dateFormatter = new Intl.DateTimeFormat("en-GB", {
		dateStyle: "medium",
	});
	const dateObj = new Date(date);
	return (
		<time dateTime={dateObj.toISOString()} {...rest}>
			{dateFormatter.format(dateObj)}
		</time>
	);
};
