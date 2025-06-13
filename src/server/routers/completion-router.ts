import { j, publicProcedure } from "../jstack";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamTextWithConversion } from "@/lib/ai-wrapper";
import { getModelConfig, AIModel } from "@/lib/models";
import { z } from "zod";

const completionRequestSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  model: z.string().min(1, "Model is required"),
  threadId: z.string().optional(),
  messageId: z.string().optional(),
  isTitle: z.boolean().optional(),
});

const createAIProvider = (
  provider: string,
  apiKey: string,
  modelId: string
) => {
  switch (provider) {
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case "openai":
      return createOpenAI({ apiKey })(modelId);
    case "openrouter":
      return createOpenRouter({ apiKey })(modelId);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
};

export const completionRouter = j.router({
  complete: publicProcedure
    .input(completionRequestSchema)
    .mutation(async ({ c, input }) => {
      try {
        const { prompt, model, isTitle } = input;
        const headersList = c.req.raw.headers;

        // Get model configuration
        const modelConfig = getModelConfig(model as AIModel);
        
        // Validate API key
        const apiKey = headersList.get(modelConfig.headerKey) as string;
        if (!apiKey?.trim()) {
          return c.json(
            { error: `${modelConfig.headerKey} header is required` },
            401
          );
        }

        // Create AI provider
        const aiModel = createAIProvider(
          modelConfig.provider,
          apiKey,
          modelConfig.modelId
        );

        // Generate appropriate system prompt based on task
        const systemPrompt = isTitle 
          ? "Generate a concise, descriptive title (max 6 words) for this conversation based on the user's message. Return only the title, no quotes or extra text."
          : "You are a helpful AI assistant. Provide a clear, concise response to the user's message.";

        // Create a message object for the prompt with the correct type
        const messages = [
          {
            role: "user" as const,
            content: prompt
          }
        ];

        // Use the streamTextWithConversion function to handle the conversion
        const result = await new Promise<{ text: string }>((resolve, reject) => {
          const stream = streamTextWithConversion({
            model: aiModel,
            messages,
            system: systemPrompt,
            maxTokens: isTitle ? 20 : 1000,
            temperature: isTitle ? 0.3 : 0.7,
            onFinish: (result) => {
              resolve({ text: result.text });
            },
            onError: (error) => {
              reject(error);
            }
          });
          
          // Return the stream to prevent it from being garbage collected
          return stream;
        });

        return c.json({
          text: result.text,
          // Note: usage and finishReason might not be available with this approach
        });
      } catch (error) {
        console.error("Completion failed:", error);
        return c.json(
          { error: "Failed to generate completion" },
          500
        );
      }
    }),
});