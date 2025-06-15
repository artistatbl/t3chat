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
        console.log('🔧 Server: Completion request received', { isTitle, model, promptLength: prompt.length });
        
        const headersList = c.req.raw.headers;

        // Get model configuration
        const modelConfig = getModelConfig(model as AIModel);
        
        // Validate API key
        const apiKey = headersList.get(modelConfig.headerKey) as string;
        if (!apiKey?.trim()) {
          console.error('❌ Server: Missing API key for', modelConfig.headerKey);
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
          ? "You are a title generator. Generate ONLY a short, descriptive title (maximum 6 words) for this conversation. Do not include quotes, explanations, or any other text. Just return the title."
          : "You are a helpful AI assistant. Provide a clear, concise response to the user's message.";

        // Create messages with more explicit instructions for title generation
        const messages = isTitle ? [
          {
            role: "user" as const,
            content: `Generate a short title (max 6 words) for a conversation that starts with: "${prompt}"`
          }
        ] : [
          {
            role: "user" as const,
            content: prompt
          }
        ];

        console.log('🎯 Server: Using system prompt for', isTitle ? 'TITLE' : 'CHAT', ':', systemPrompt);
        console.log('📝 Server: Messages:', messages);

        // Use the streamTextWithConversion function to handle the conversion
        const result = await new Promise<{ text: string }>((resolve, reject) => {
          const stream = streamTextWithConversion({
            model: aiModel,
            messages,
            system: systemPrompt,
            maxTokens: isTitle ? 15 : 1000,  // Reduced for titles
            temperature: isTitle ? 0.1 : 0.7,  // Lower temperature for more consistent titles
            onFinish: (result) => {
              console.log('✅ Server: Completion finished', { isTitle, text: result.text });
              // Clean up the title if it contains quotes or extra text
              const cleanedText = isTitle ? result.text.replace(/["']/g, '').trim() : result.text;
              resolve({ text: cleanedText });
            },
            onError: (error) => {
              console.error('❌ Server: Completion error', { isTitle, error });
              reject(error);
            }
          });
          
          return stream;
        });

        console.log('📤 Server: Returning result', { isTitle, text: result.text });
        return c.json({
          text: result.text,
        });
      } catch (error) {
        console.error('❌ Server: Completion failed:', error);
        return c.json(
          { error: "Failed to generate completion" },
          500
        );
      }
    }),
});