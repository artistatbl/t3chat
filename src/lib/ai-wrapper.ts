import { streamText, CoreMessage, StreamTextTransform, ToolSet } from "ai";
import { LanguageModel } from "ai";
// Only import z if you're using it elsewhere in the file
// import { z } from "zod";


// Define the message types that match your Zod schema
type AppMessage = {
  role: "user" | "assistant" | "system";
  content: string | Array<{
    type: "text" | "image_url";
    text?: string;
    image_url?: {
      url: string;
    };
  }>;
};

// Convert your app's message format to the CoreMessage format
export function convertToCoreMessage(message: AppMessage): CoreMessage {
  switch (message.role) {
    case "system":
      if (typeof message.content !== "string") {
        throw new Error("System messages must have string content.");
      }
      return { role: "system", content: message.content };

    case "user":
      if (typeof message.content === "string") {
        return { role: "user", content: message.content };
      } else {
        return {
          role: "user",
          content: message.content.map((part) => {
            if (part.type === "text") {
              return { type: "text", text: part.text ?? "" };
            } else if (part.type === "image_url" && part.image_url) {
              return {
                type: "image",
                image: new URL(part.image_url.url),
              };
            }
            throw new Error("Invalid message part type");
          }),
        };
      }

    case "assistant":
      if (typeof message.content === "string") {
        return { role: "assistant", content: message.content };
      } else {
        // For assistant messages, we need to filter out image parts
        // since they're not allowed in AssistantContent
        const validParts = message.content.filter(part => part.type === "text");
        
        if (validParts.length !== message.content.length) {
          console.warn("Removed image parts from assistant message as they're not supported");
        }
        
        return {
          role: "assistant",
          content: validParts.map((part) => {
            if (part.type === "text") {
              return { type: "text", text: part.text ?? "" };
            }
            // This should never happen due to the filter above
            throw new Error("Invalid message part type");
          }),
        };
      }

    default:
      throw new Error(`Unhandled message role: ${message.role}`);
  }
}

// Wrapper for streamText that handles the conversion
export function streamTextWithConversion({
  model,
  messages,
  system,
  maxTokens,
  temperature,
  experimental_transform,
  abortSignal,
  onError,
  onFinish,
}: {
  model: LanguageModel;
  messages: AppMessage[];
  system?: string;
  maxTokens?: number;
  temperature?: number;
  experimental_transform?: StreamTextTransform<ToolSet> | StreamTextTransform<ToolSet>[];
  abortSignal?: AbortSignal;
  onError?: (error: unknown) => void;
  onFinish?: (result: { text: string }) => void;
}) {
  // Convert messages to CoreMessage format
  const coreMessages = messages.map(convertToCoreMessage);

  // Call the original streamText function with converted messages
  return streamText({
    model,
    messages: coreMessages,
    system,
    maxTokens,
    temperature,
    experimental_transform,
    abortSignal,
    onError,
    onFinish,
  });
}