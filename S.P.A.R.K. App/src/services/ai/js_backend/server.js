
import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import { AzureOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { RetrievalQAChain } from "langchain/chains";

const app = express();
const port = 5002;

app.use(bodyParser.json());
app.use(cors());

// Simple document store for RAG
const documents = [
    "User engagement is a key metric for application success.",
    "Profit margin is calculated as (Revenue - Cost) / Revenue.",
    "To improve user engagement, consider adding new features, improving UX, or running marketing campaigns.",
    "To improve profit margins, you can increase prices, reduce costs, or sell more.",
    "S.P.A.R.K. is an application for Elykid Private Limited.",
];

// A simple, rule-based SLM for generating recommendations
function generate_recommendation(system_data) {
    if (system_data.user_engagement_rate < 0.5) {
        return {
            title: "Improve User Engagement",
            description: "User engagement is below 50%. Consider adding new features or improving the user experience to increase retention.",
            priority: "High"
        };
    } else if (system_data.profit_margin < 0.2) {
        return {
            title: "Optimize for Profitability",
            description: "Profit margin is below 20%. Analyze pricing strategies and cost structures to improve profitability.",
            priority: "High"
        };
    } else {
        return {
            title: "Maintain Current Strategy",
            description: "System metrics are stable. Continue with the current strategy and monitor for any changes.",
            priority: "Low"
        };
    }
}

app.post('/analyze', (req, res) => {
    const system_data = req.body || {};
    // to have some default values
    if (!system_data.hasOwnProperty('user_engagement_rate')) {
        system_data.user_engagement_rate = 1.0;
    }
    if (!system_data.hasOwnProperty('profit_margin')) {
        system_data.profit_margin = 1.0;
    }
    const recommendation = generate_recommendation(system_data);
    res.json(recommendation);
});

app.post('/chat', async (req, res) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: "Invalid input, 'message' is required." });
    }

    try {
        // Check for Azure OpenAI environment variables
        if (!process.env.AZURE_OPENAI_API_KEY || !process.env.AZURE_OPENAI_API_INSTANCE_NAME || !process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME || !process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME) {
            console.error("Azure OpenAI environment variables not set.");
            return res.status(500).json({ error: "Azure OpenAI environment variables not set." });
        }

        const model = new AzureOpenAI({
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
            azureOpenAIApiVersion: "2023-07-01-preview",
        });

        const embeddings = new AzureOpenAIEmbeddings({
            azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY,
            azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME,
            azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_EMBEDDINGS_DEPLOYMENT_NAME,
            azureOpenAIApiVersion: "2023-07-01-preview",
        });

        const vectorStore = await MemoryVectorStore.fromTexts(documents, {}, embeddings);
        const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

        const result = await chain.call({ query: message });

        res.json({ response: result.text });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: `Error generating response: ${e.message}` });
    }
});

app.listen(port, () => {
    console.log(`JavaScript server listening on port ${port}`);
});
