"use client";

import { useState, useEffect } from "react";
import { AIModel, getModelConfig } from "@/lib/models";

interface ApiKeysState {
  [key: string]: string;
}

export function useApiKeys() {
  const [apiKeys, setApiKeys] = useState<ApiKeysState>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const loadApiKeys = () => {
      try {
        const storedKeys = localStorage.getItem("t3chat-api-keys");
        if (storedKeys) {
          setApiKeys(JSON.parse(storedKeys));
        }
      } catch (error) {
        console.error("Failed to load API keys from localStorage:", error);
      } finally {
        setIsLoaded(true);
      }
    };

    loadApiKeys();
  }, []);

  // Save API keys to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem("t3chat-api-keys", JSON.stringify(apiKeys));
      } catch (error) {
        console.error("Failed to save API keys to localStorage:", error);
      }
    }
  }, [apiKeys, isLoaded]);

  // Check if an API key exists for a specific model
  const hasApiKey = (model: AIModel): boolean => {
    const modelConfig = getModelConfig(model);
    const headerKey = modelConfig.headerKey.replace('x-', '');
    return Boolean(apiKeys[headerKey]);
  };

  // Get an API key for a specific model
  const getApiKey = (model: AIModel): string | null => {
    const modelConfig = getModelConfig(model);
    const headerKey = modelConfig.headerKey.replace('x-', '');
    return apiKeys[headerKey] || null;
  };

  // Save an API key for a specific model
  const saveApiKey = (model: AIModel, apiKey: string) => {
    const modelConfig = getModelConfig(model);
    const headerKey = modelConfig.headerKey.replace('x-', '');
    setApiKeys((prev) => ({
      ...prev,
      [headerKey]: apiKey,
    }));
  };

  // Remove an API key for a specific model
  const removeApiKey = (model: AIModel) => {
    const modelConfig = getModelConfig(model);
    const headerKey = modelConfig.headerKey.replace('x-', '');
    setApiKeys((prev) => {
      const newKeys = { ...prev };
      delete newKeys[headerKey];
      return newKeys;
    });
  };

  return {
    apiKeys,
    hasApiKey,
    getApiKey,
    saveApiKey,
    removeApiKey,
    isLoaded,
  };
}