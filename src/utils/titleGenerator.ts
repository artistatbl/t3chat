// import { client } from '@/lib/client';

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
): Promise<void> {
  if (!message.trim() || !threadId || !apiKey) {
    console.warn('❌ TitleGenerator: Missing required parameters for title generation');
    console.log('📊 TitleGenerator: Thread ID:', threadId);
    console.log('📊 TitleGenerator: Message empty:', !message.trim());
    console.log('📊 TitleGenerator: API key empty:', !apiKey);
    return;
  }

  try {
    console.log('📝 TitleGenerator: Starting title generation for message:', message.substring(0, 20) + '...');
    console.log('📊 TitleGenerator: Using model:', model);
    console.log('📊 TitleGenerator: Thread ID:', threadId);
    
    // Make the API call to generate the title with timeout
    console.log('🔄 TitleGenerator: Making API call to generate title');
    let responseText = 'No response received';
    
    // Create an AbortController for timeout management
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
    
    try {
      // Prepare the request with the signal
      const requestOptions = {
        headers: {
          [modelConfig.headerKey]: apiKey,
          'Content-Type': 'application/json'
        },
        signal: controller.signal
      };
      
      // Log the request details (without sensitive info)
      console.log('📤 TitleGenerator: Sending request with payload:', {
        prompt: message.substring(0, 20) + '...',
        threadId,
        isTitle: true,
        model
      });
      
      const response = await fetch(`${window.location.origin}/api/completion/complete`, {
        method: 'POST',
        headers: requestOptions.headers,
        body: JSON.stringify({
          prompt: message.trim(),
          threadId,
          isTitle: true,
          model,
        }),
        signal: requestOptions.signal
      });
      
      // Clear the timeout since we got a response
      clearTimeout(timeoutId);
      
      console.log('📊 TitleGenerator: API response received');
      console.log('📊 TitleGenerator: API response status:', response.status);
      
      // Read the response text
      responseText = await response.text();
      console.log('📊 TitleGenerator: Raw response text:', responseText);
      
      if (!response.ok) {
        console.error('❌ TitleGenerator: API response error status:', response.status);
        console.error('❌ TitleGenerator: API response error text:', responseText);
        throw new Error(`Failed to generate title: ${response.status} ${responseText}`);
      }

      console.log('✅ TitleGenerator: API call successful, parsing response');
      let result;
      try {
        result = JSON.parse(responseText);
        console.log('📊 TitleGenerator: Parsed JSON result:', result);
      } catch (parseError) {
        console.error('❌ TitleGenerator: Failed to parse JSON response:', parseError);
        console.error('❌ TitleGenerator: Raw response that failed to parse:', responseText);
        throw new Error(`Failed to parse title response: ${parseError}`);
      }
      
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
        return;
      } else {
        console.warn('⚠️ TitleGenerator: No title was generated');
      }
    } catch (error) {
      // Check if this was a timeout
      if (error) {
        console.error('%c ❌ TITLE GENERATION TIMEOUT: Request took too long', 'background: #F44336; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
      } else {
        console.error('%c ❌ TITLE GENERATION ERROR: ' + error, 'background: #F44336; color: white; font-size: 16px; padding: 5px; border-radius: 5px;');
      }
      console.error('❌ TitleGenerator: Last response text:', responseText);
      
      // Clean up timeout if error occurs before response
      clearTimeout(timeoutId);
    }
  } catch (error) {
    console.error('❌ TitleGenerator: Failed to generate or save title:', error);
  }
}