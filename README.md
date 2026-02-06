## Prerequisites

1. Latest stable NodeJS
2. Latest stable Typescript
3. Permission to deploy apps in the Dynatrace Environment

## Installation 

1. Download zip
2. Unzip
3. Modify `app.config.json`
- Change `environmentURL` to reflect your Dynatrace Environment
4. Run `npx dt-app deploy` deploy from a terminal within the project folder.
- If successful, you should see a new connector as an option when adding a new task to a Workflow.

## Uninstall

1. Run `npx dt-app uninstall` from a terminal within the project folder.

## Usage

Follow these steps to set up an automated AI analysis workflow in Dynatrace.

### 1. Fetch your data
Create a new workflow and add a task to fetch the data you want analyzed (e.g., logs, events, or metrics).
* **Action:** Add a **DQL Query** task named `execute_dql_query`.
* **Example Query:**
    ```sql
    fetch logs  
    | filter matchesValue(status, "ERROR")  
    | summarize count=count(), by:{content}  
    | limit 10
    ```

### 2. Data Optimization
To save on token costs and improve response accuracy, use a script to extract only the necessary records before sending them to Claude.
* **Action:** Add a **Run JavaScript** task.
* **Code:**
    ```javascript
    import { execution, result } from "@dynatrace-sdk/automation-utils";

    export default async function () {
      // Ensure the string matches your DQL task name
      const taskExecutionResult = await result("execute_dql_query");
      return taskExecutionResult['records'];
    }
    ```

### 3. Configure the Claude Task
1. Add a new task and search for **Claude**.
   
<img width="400" height="250" alt="1" src="https://github.com/user-attachments/assets/333ce36b-a0a8-4247-ab2b-dfc37d38d356" />
  
2. Under **Input**, click **+ Create a new connection**.

<img width="350" height="350" alt="2" src="https://github.com/user-attachments/assets/a085842f-f2f9-403a-a0f7-faf5dee8070e" />

3. Enter a **Connection Name**, your **Model ID**, and your **API Key**. 
   > **Note:** Do not modify the URL unless you are using a custom endpoint.
4. Click **Add item**. Your connection should now show up on the Connection dropdown for the task (refresh page if not).

<img width="550" height="600" alt="3" src="https://github.com/user-attachments/assets/f43591c3-7174-412f-a73a-92f32050a802" />

### 4. Set up the Prompt
* **Prompt:** Enter the specific question or instruction for the AI (e.g., * **Prompt:** Enter the specific question or instruction for the AI (e.g., *Explain the errors in the following logs to me, response as single line of text:*).
* **Name of Task with data to analyze:** Enter the exact name of the task from Step 1 (or Step 2 if you used the optimization script).

### 5. (Optional) Store the AI Response
You can archive Claude's analysis back into Dynatrace as a log for long-term tracking.
1. Add a **Run JavaScript** task.
2. Use the Dynatrace SDK to ingest the task output as a log, sample code below.
    ```sql
    import { execution, result } from "@dynatrace-sdk/automation-utils";
    import { logsClient } from '@dynatrace-sdk/client-classic-environment-v2';
    
    export default async function () {
      const taskExecutionResult = await result('claude_1');
    
      console.log('print: ', taskExecutionResult.response);
      
      return await logsClient.storeLog({
        body: [
          {
            'content': taskExecutionResult.response,
            'log.source': 'Claude',
            'type': 'AI Summary',
          }
        ],
        type: 'application/json; charset=utf-8'
      });
    }
    ```   
4. To view your AI summaries later, run the following in the **Logs** app:
    ```sql
    fetch logs
    | filter matchesValue(type, "AI Summary") AND matchesValue(log.source, "Claude")
    ```
