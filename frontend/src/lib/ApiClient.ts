const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export class ApiClient {
	private readonly baseUrl: string;

	constructor(baseUrl: string = API_URL) {
		this.baseUrl = baseUrl;
	}

	async post<T>(path: string, data: any): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		const responseData = await response.json();

		if (!response.ok) {
			throw new Error(responseData.error || "API request failed");
		}

		return responseData;
	}

	async get<T>(path: string): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`);
		const data = await response.json();

		if (!response.ok) {
			throw new Error(data.error || "API request failed");
		}

		return data;
	}

	async put<T>(path: string, data: any): Promise<T> {
		const response = await fetch(`${this.baseUrl}${path}`, {
			method: "PUT",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		});

		const responseData = await response.json();

		if (!response.ok) {
			throw new Error(responseData.error || "API request failed");
		}

		return responseData;
	}
}

export const apiClient = new ApiClient();
