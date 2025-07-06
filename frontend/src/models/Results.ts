export type Results<T> = {
	items: T[];
	total: number;
	pages: number;
	currentPage: number;
};

export const resultsFromResponse = <T>(
	response: any,
	resultMap: (items: any) => T[],
): Results<T> => {
	return {
		items: resultMap(response.items),
		total: response.total,
		pages: response.pages,
		currentPage: response.page,
	};
};
