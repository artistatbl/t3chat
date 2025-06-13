import { j, publicProcedure } from "../jstack";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
// Replace the existing import
// import { streamText, smoothStream, CoreMessage } from "ai";
// With:
import { smoothStream } from "ai";
import { streamTextWithConversion } from "@/lib/ai-wrapper";

import { getModelConfig, AIModel } from "@/lib/models";
import { z } from "zod";

// Enhanced schema with validation for multimodal content
const chatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.union([
          z.string().min(1, "Message content cannot be empty"),
          z.array(
            z.object({
              type: z.enum(["text", "image_url"]),
              text: z.string().optional(),
              image_url: z
                .object({
                  url: z.string().url(),
                })
                .optional(),
            })
          ).min(1, "Message content cannot be empty"),
        ]),
      })
    )
    .min(1, "At least one message is required")
    .max(100, "Too many messages"),
  model: z.string().min(1, "Model is required"),
});

// System prompt as a constant for better maintainability
const SYSTEM_PROMPT = `You are T3 Chat, an AI assistant powered by the Gemini 2.5 Pro model. Your role is to assist and engage in conversation while being helpful, respectful, and engaging.
- If you are specifically asked about the model you are using, you may mention that you use the Gemini 2.5 Pro model. If you are not asked specifically about the model you are using, you do not need to mention it.
- The current date and time including timezone is 6/13/2025, 7:51:20 PM GMT+1.
- Always use LaTeX for mathematical expressions:
    - Inline math must be wrapped in escaped parentheses: \\( content \\)
    - Do not use single dollar signs for inline math
    - Display math must be wrapped in double dollar signs: $$ content $$
- Do not use the backslash character to escape parenthesis. Use the actual parentheses instead.
- Ensure code is properly formatted using Prettier with a print width of 80 characters
- Present code in Markdown code blocks with the correct language extension indicated`;

// Provider factory for better organization
// Provider factory with multimodal support
const createAIProvider = (
  provider: string,
  apiKey: string,
  modelId: string
) => {
  switch (provider) {
    case "google":
      return createGoogleGenerativeAI({ apiKey })(modelId);
    case "openai":
      // Use a model that supports multimodal inputs like gpt-4-vision-preview
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
        } catch {
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
        } catch {
          throw new ChatError(
            `Failed to initialize ${modelConfig.provider} provider`,
            500,
            "PROVIDER_INIT_ERROR"
          );
        }

        //
        // START OF FIXED CODE
        //
        // Use a switch statement to properly narrow the types for CoreMessage.
      
        //
        // END OF FIXED CODE
        //

        // Stream configuration
        // With:
        const result = streamTextWithConversion({
          model: aiModel,
          messages: messages,
          system: SYSTEM_PROMPT,
          maxTokens: 4000,
          temperature: 0.7,
          experimental_transform: [
            smoothStream({
              chunking: /[.!?]\s+/,
              delayInMs: 10,
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
              // Remove usage logging since it's not available in the result type
              text: result.text,
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
//error.statusCode
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