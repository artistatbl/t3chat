import { j, publicProcedure } from "../jstack";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { streamText, smoothStream } from "ai";
import { getModelConfig, AIModel } from "@/lib/models";
import { z } from "zod";

// Enhanced schema with validation
const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1, "Message content cannot be empty"),
      })
    )
    .min(1, "At least one message is required")
    .max(100, "Too many messages"),
  model: z.string().min(1, "Model is required"),
});

// System prompt as a constant for better maintainability
const SYSTEM_PROMPT = `You are Chat0, an AI assistant that can answer questions and help with tasks.

Key guidelines:
- Be helpful and provide relevant, accurate information
- Be respectful and polite in all interactions
- Be engaging and maintain a conversational tone
- Keep responses concise but comprehensive

Mathematical expressions:
- Inline math: Use single dollar signs $content$
- Display math: Use double dollar signs $$content$$
- Display math should be on its own line
- Do not nest math delimiters or mix styles

Examples:
- Inline: The equation $E = mc^2$ shows mass-energy equivalence
- Display:
$$\\frac{d}{dx}\\sin(x) = \\cos(x)$$`;

// Provider factory for better organization
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

// Custom error class for better error handling
class ChatError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = "ChatError";
  }
}

export const chatRouter = j.router({
  streamCompletion: publicProcedure
    .input(chatRequestSchema)
    .mutation(async ({ c, input }) => {
      const startTime = Date.now();

      try {
        const { messages, model } = input;
        const headersList = c.req.raw.headers;

        // Get model configuration with error handling
        let modelConfig;
        try {
          modelConfig = getModelConfig(model as AIModel);
        } catch{
          throw new ChatError(`Invalid model: ${model}`, 400, "INVALID_MODEL");
        }

        // Validate API key
        const apiKey = headersList.get(modelConfig.headerKey) as string;
        if (!apiKey?.trim()) {
          throw new ChatError(
            `${modelConfig.headerKey} header is required`,
            401,
            "MISSING_API_KEY"
          );
        }

        // Create AI provider with error handling
        let aiModel;
        try {
          aiModel = createAIProvider(
            modelConfig.provider,
            apiKey,
            modelConfig.modelId
          );
        } catch  {
          throw new ChatError(
            `Failed to initialize ${modelConfig.provider} provider`,
            500,
            "PROVIDER_INIT_ERROR"
          );
        }

        // Convert messages with validation
        const coreMessages = messages.map((msg) => ({
          role: msg.role,
          content: msg.content.trim(),
        }));

        // Stream configuration
        const result = streamText({
          model: aiModel,
          messages: coreMessages,
          system: SYSTEM_PROMPT,
          maxTokens: 4000, // Reasonable limit
          temperature: 0.7, // Balanced creativity
          experimental_transform: [
            smoothStream({
              chunking: /[.!?]\s+/,
              delayInMs: 10, // Slight delay for smoother streaming
            }),
          ],
          abortSignal: c.req.raw.signal,
          onError: (error) => {
            console.error("Stream generation error:", {
              error: error instanceof Error ? error.message : String(error),
              model: modelConfig.modelId,
              provider: modelConfig.provider,
              timestamp: new Date().toISOString(),
            });
          },
          onFinish: (result) => {
            const duration = Date.now() - startTime;
            console.info("Stream completed:", {
              model: modelConfig.modelId,
              provider: modelConfig.provider,
              duration: `${duration}ms`,
              usage: result.usage,
              timestamp: new Date().toISOString(),
            });
          },
        });

        return result.toDataStreamResponse({
          sendReasoning: false,
          getErrorMessage: (error) => {
            // Enhanced error message handling
            if (error instanceof Error) {
              return error.message;
            }
            return "An unexpected error occurred during streaming";
          },
        });
      } catch (error) {
        const duration = Date.now() - startTime;

        // Enhanced error logging
        console.error("Chat completion failed:", {
          error: error instanceof Error ? error.message : "Unknown error",
          stack: error instanceof Error ? error.stack : undefined,
          input: {
            model: input.model,
            messageCount: input.messages.length,
          },
          duration: `${duration}ms`,
          timestamp: new Date().toISOString(),
        });

        // Return appropriate error response
        if (error instanceof ChatError) {
          return c.json(
            {
              error: error.message,
              code: error.code,
              timestamp: new Date().toISOString(),
            },
            //rror.statusCode
          );
        }

        // Generic error response
        return c.json(
          {
            error: "Internal server error occurred",
            code: "INTERNAL_ERROR",
            timestamp: new Date().toISOString(),
          },
          500
        );
      }
    }),
});