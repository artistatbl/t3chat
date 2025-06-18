// Add this import at the top
import { client } from '@/lib/client';

/**
 * Generates and saves a title for a new chat based on the first message
 * @param threadId The ID of the chat thread
 * @param message The first message content
 * @param apiKey The API key for the model
 * @param modelConfig The configuration for the selected model
 * @param saveChatTitle Function to save the generated title to the database
 * @param model The selected AI model to use for title generation
 */
export async function generateAndSaveTitle(
  threadId: string,
  message: string,
  apiKey: string,
  modelConfig: { headerKey: string },
  saveChatTitle: (title: string) => Promise<void>,
  model: string
): Promise<string | undefined> {
  if (!message.trim() || !threadId || !apiKey) {
    console.warn('❌ TitleGenerator: Missing required parameters for title generation');
    console.log('📊 TitleGenerator: Thread ID:', threadId);
    console.log('📊 TitleGenerator: Message empty:', !message.trim());
    console.log('📊 TitleGenerator: API key empty:', !apiKey);
    return undefined;
  }

  try {
    console.log('📝 TitleGenerator: Starting title generation for message:', message.substring(0, 20) + '...');
    console.log('📊 TitleGenerator: Using model:', model);
    console.log('📊 TitleGenerator: Thread ID:', threadId);
    
    // Make the API call to generate the title with timeout
    console.log('🔄 TitleGenerator: Making API call to generate title');
    
    // Create an AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout
    
    try {
      // Log the request details (without sensitive info)
      console.log('📤 TitleGenerator: Sending request with payload:', {
        prompt: message.substring(0, 20) + '...',
        threadId,
        isTitle: true,
        model
      });
      
      // Use the client instead of direct fetch
      const response = await client.completion.complete.$post({
        prompt: message.trim(),
        threadId,
        model,
        isTitle: true, // Explicitly set isTitle to true
      }, {
        headers: {
          [modelConfig.headerKey]: apiKey,
        },
        // Remove this line - signal: controller.signal
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      console.log('📊 TitleGenerator: API response received');
      console.log('📊 TitleGenerator: API response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ TitleGenerator: API response error status:', response.status);
        console.error('❌ TitleGenerator: API response error text:', errorText);
        throw new Error(`Failed to generate title: ${response.status} ${errorText}`);
      }

      console.log('✅ TitleGenerator: API call successful, parsing response');
      const result = await response.json();
      console.log('📊 TitleGenerator: Parsed JSON result:', result);
      
      if ('error' in result) {
        console.error('❌ TitleGenerator: Error in result:', result.error);
        throw new Error(result.error);
      }

      const generatedTitle = result.text;
      console.log('%c ✅ TITLE GENERATED: ' + generatedTitle, 'background: #4CAF50; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
      
      if (generatedTitle) {
        console.log('💾 TitleGenerator: Saving title to database');
        await saveChatTitle(generatedTitle);
        console.log('%c ✅ TITLE SAVED SUCCESSFULLY: ' + generatedTitle, 'background: #2196F3; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
        return generatedTitle;
      } else {
        console.warn('⚠️ TitleGenerator: No title was generated');
        return undefined;
      }
    } catch (error) {
      // Check if this was a timeout or abort
      if (error) {
        console.error('%c ❌ TITLE GENERATION TIMEOUT: Request took too long', 'background: #F44336; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
      } else {
        console.error('%c ❌ TITLE GENERATION ERROR: ' + error, 'background: #F44336; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
      }
      // Clean up timeout if error occurs before response
      clearTimeout(timeoutId);
      return undefined;
    }
  } catch (error) {
    console.error('❌ TitleGenerator: Failed to generate or save title:', error);
    
    // Fallback to a simple title if all else fails
    try {
      const words = message.trim().split(' ').slice(0, 6);
      const fallbackTitle = words.join(' ') + (message.split(' ').length > 6 ? '...' : '');
      console.log('%c ⚠️ USING FALLBACK TITLE: ' + fallbackTitle, 'background: #FF9800; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
      await saveChatTitle(fallbackTitle);
      return fallbackTitle;
    } catch (fallbackError) {
      console.error('Failed to save fallback title:', fallbackError);
      return undefined;
    }
  }
}