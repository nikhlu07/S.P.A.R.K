
// The URL of the JavaScript SLM service
const SLM_URL = "http://127.0.0.1:5002";

// Define a structured data type for recommendations
export interface Recommendation {
    title: string;
    description: string;
    priority: string;
}

// Define a structured data type for system data
export interface SystemData {
    user_engagement_rate: number;
    profit_margin: number;
}

// Record for the chatbot response
export interface ChatResponse {
    response?: string;
    error?: string;
}

/**
 * Analyzes system data to generate a new recommendation.
 * @param system_data The system data to analyze.
 * @returns A promise that resolves to a recommendation.
 */
export async function analyzeSystem(system_data: SystemData): Promise<Recommendation> {
    const response = await fetch(`${SLM_URL}/analyze`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(system_data)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

/**
 * Sends a message to the chatbot.
 * @param message The message to send to the chatbot.
 * @returns A promise that resolves to the chatbot's response.
 */
export async function chat(message: string): Promise<ChatResponse> {
    try {
        const response = await fetch(`${SLM_URL}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ message })
        });

        if (!response.ok) {
            const errorText = await response.text();
            return { error: `HTTP error! status: ${response.status}, message: ${errorText}` };
        }

        return await response.json();
    } catch (e: any) {
        return { error: `Failed to fetch: ${e.message}` };
    }
}
