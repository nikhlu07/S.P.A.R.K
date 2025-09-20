
import { Canister, query, update, Vec, Record, nat64, text, StableBTreeMap, Opt, ic, blob } from 'azle';

// Define a structured data type for recommendations
const Recommendation = Record({
    id: nat64,
    title: text,
    description: text,
    priority: text,
    createdAt: nat64,
});

type Recommendation = typeof Recommendation.tsType;

// Record for the chatbot response
const ChatResponse = Record({
    response: text,
    error: Opt(text),
});

// Types for HTTP outcalls
const HttpHeader = Record({ name: text, value: text });

const HttpResponse = Record({
    status: nat64,
    headers: Vec(HttpHeader),
    body: blob,
});

const HttpTransformArgs = Record({
    response: HttpResponse,
    context: blob,
});

// Use a stable B-tree map for persistent storage
let recommendations = StableBTreeMap<nat64, Recommendation>(0, nat64, Recommendation);

// Counter for generating unique IDs
let nextId: nat64 = 0n;

// The URL of the JavaScript SLM service
const SLM_URL = "http://127.0.0.1:5002";

export default Canister({
    // Query to get all recommendations
    getRecommendations: query([], Vec(Recommendation), () => {
        return recommendations.values();
    }),

    // Query to get a specific recommendation by ID
    getRecommendation: query([nat64], Opt(Recommendation), (id) => {
        return recommendations.get(id);
    }),

    // SLM-based analysis function to generate a new recommendation
    analyzeSystem: update([], Recommendation, async () => {
        const response = await ic.call(ic.managementCanister.http_request, {
            args: [
                {
                    url: `${SLM_URL}/analyze`,
                    method: { post: null },
                    headers: [['Content-Type', 'application/json']],
                    body: Opt.Some(new TextEncoder().encode(JSON.stringify({}))),
                    max_response_bytes: Opt.Some(2_000n),
                    transform: Opt.Some({
                        function: [ic.id(), 'httpTransform'],
                        context: new Uint8Array(),
                    }),
                },
            ],
            cycles: 50_000_000n, // Adjust cycles as needed
        });

        const decodedResponse = JSON.parse(new TextDecoder().decode(response.body));

        const newRecommendation: Recommendation = {
            id: nextId,
            title: decodedResponse.title,
            description: decodedResponse.description,
            priority: decodedResponse.priority,
            createdAt: BigInt(Date.now()),
        };

        recommendations.insert(newRecommendation.id, newRecommendation);
        nextId++;

        return newRecommendation;
    }),

    // Chat with the Gemini-powered chatbot
    chat: update([text], ChatResponse, async (message) => {
        const response = await ic.call(ic.managementCanister.http_request, {
            args: [
                {
                    url: `${SLM_URL}/chat`,
                    method: { post: null },
                    headers: [['Content-Type', 'application/json']],
                    body: Opt.Some(new TextEncoder().encode(JSON.stringify({ message }))),
                    max_response_bytes: Opt.Some(2_000n),
                    transform: Opt.Some({
                        function: [ic.id(), 'httpTransform'],
                        context: new Uint8Array(),
                    }),
                },
            ],
            cycles: 50_000_000n, // Adjust cycles as needed
        });

        const decodedResponse = JSON.parse(new TextDecoder().decode(response.body));

        if (decodedResponse.error) {
            return { response: "", error: Opt.Some(decodedResponse.error) };
        }

        return { response: decodedResponse.response, error: Opt.None };
    }),

    // Transform function for HTTP outcalls
    httpTransform: query([HttpTransformArgs], HttpResponse, (args) => {
        return {
            ...args.response,
            headers: [], // Strip headers for security
        };
    }),
});
