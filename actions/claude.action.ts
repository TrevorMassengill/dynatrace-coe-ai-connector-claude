import { userLogger } from '@dynatrace-sdk/automation-action-utils/actions';
import { appSettingsObjectsClient } from '@dynatrace-sdk/client-app-settings-v2';
import { execution, result } from "@dynatrace-sdk/automation-utils";

export default async (payload: any) => {
  const taskExecutionResult = await result(payload.data);

  if (!payload.prompt) {
    throw new Error("Input field 'prompt' is missing.");
  }

  if (!payload.connectionId) {
    throw new Error("Input field 'connectionId' is missing.");
  }

  if (!payload.tokens) {
    throw new Error("Input field 'max_tokens' is missing.");
  }

  const connectionObject = await appSettingsObjectsClient.getAppSettingsObjectByObjectId({ objectId: payload.connectionId });

  async function callClaude(prompt: string) {
    const response = await fetch(connectionObject?.value?.url, {
      method: "POST",
      headers: {
        "x-api-key": connectionObject?.value?.token,
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        "messages": [
          {
            "content": prompt + "\n" + JSON.stringify(taskExecutionResult),
            "role": "user"
          }
        ],
        "model": connectionObject?.value?.model,
        "max_tokens": Number(payload.tokens)
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      userLogger.info("HTTP error! status:" + response.status);
      userLogger.info("API Error Body:" + JSON.stringify(errorBody));
      return {status: response.status, error: errorBody};
    }

    const data = await response.json();
    return data;
  }

  const claudeResponse : any = await callClaude(payload.prompt);
  userLogger.info(JSON.stringify(claudeResponse.content[0].text));
  return { 
    response: claudeResponse.content[0].text,
    tokens: {
      input: claudeResponse.usage["input_tokens"],
      output: claudeResponse.usage["output_tokens"]
    },
    fullResponse: claudeResponse
  };
};
