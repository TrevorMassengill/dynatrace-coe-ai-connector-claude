import { AutomationTextInput, AutomationConnectionPicker } from '@dynatrace/automation-action-components';
import { FormField, Label } from '@dynatrace/strato-components-preview/forms';
import { ActionWidget } from '@dynatrace-sdk/automation-action-utils';
import React from 'react';

interface ClaudeInput {
  prompt: string;
  data: string;
  tokens: string;
  connectionId: string;
}

const ClaudeWidget: ActionWidget<ClaudeInput> = (props) => {
  const { value, onValueChanged } = props;

  const updateValue = (newValue: Partial<ClaudeInput>) => {
    onValueChanged({ ...value, ...newValue });
  };

  return (
    <>
      <FormField>
        <Label>Connection</Label>
        <AutomationConnectionPicker
          connectionId={value.connectionId}
          schema='claude-connection'
          onChange={(connectionId) => updateValue({ connectionId })}
        />
      </FormField>
      <FormField>
        <Label>Prompt</Label>
        <AutomationTextInput value={value.prompt} onChange={(prompt: string) => updateValue({ prompt })} />
        <Label>Name of Task with data to analyze</Label>
        <AutomationTextInput value={value.data} onChange={(data: string) => updateValue({ data })} />
        <Label>Max Tokens</Label>
        <AutomationTextInput value={value.tokens} onChange={(tokens: string) => updateValue({ tokens })} />
      </FormField>
    </>
  );
};

export default ClaudeWidget;
