Demo video Youtube Link: https://youtu.be/c1Z0OM7YV5k?si=oCmDg-gHfl1Twfmb

# Workflow Automation System

A full-stack Workflow Automation System that allows users to create, manage, and execute automated workflows through a visual interface. The project consists of a Spring Boot backend and a React/Vite frontend.

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18+ recommended)
- **Java Development Kit (JDK)** (v17+ recommended)
- **Maven** (for building the backend)

### 1. Running the Backend (Spring Boot)

The backend provides the core workflow engine and REST APIs.

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Run the Spring Boot application using Maven:
   ```bash
   mvn spring-boot:run
   ```
   > The backend server will start locally on `http://localhost:8080`.

### 2. Running the Frontend (React + Vite)

The frontend provides the interactive Workflow Editor and Dashboard.

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the dependencies (if you haven't already):
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   > The frontend application will be available at `http://localhost:5173`.


---

## 📖 Step-by-Step Example: How to Use the System

Here is a quick walkthrough on how to create and execute your first workflow using the user interface and the underlying APIs.

### Step 1: Access the Dashboard
1. Open your browser and navigate to `http://localhost:5173`.
2. You will be greeted by the main dashboard which lists all existing workflows.

### Step 2: Create a New Workflow
1. Click on the **"Create Workflow"** button in the UI.
2. In the Workflow Editor, you can specify properties for your workflow (e.g., Name, Description).
3. Save the workflow. 
   - *Behind the scenes: The frontend makes a `POST /api/workflows` request to the backend with the workflow details.*

### Step 3: Execute the Workflow
1. Once created, select your new workflow from the dashboard.
2. Click the **"Execute"** or **"Run"** button.
3. You may be prompted to provide an initial payload (JSON data) for the execution.
4. Confirm the execution.
   - *Behind the scenes: The frontend sends a `POST /api/workflows/{id}/execute` request.*

### Step 4: Monitor the Execution
1. Navigate to the Executions or History tab for that workflow.
2. You can see the real-time status of your workflow execution (e.g., `PENDING`, `RUNNING`, `COMPLETED`, `FAILED`).
3. If an execution fails, you have the option to **Retry** or **Cancel** it using the respective buttons.
   - *Behind the scenes: The frontend periodically polls or fetches `GET /api/workflows/{id}/executions` to update the UI status.*

---

## 💻 API Example: Step-by-Step with cURL

If you prefer to interact with the system via the command line or an API client (like Postman), here is a complete example.

### Step 1: Create a Workflow
Create a new workflow that takes a `user_email` and an `amount` as input.

```bash
curl -X POST http://localhost:8080/api/workflows \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Process Payment",
    "inputSchema": "{\"type\":\"object\",\"properties\":{\"user_email\":{\"type\":\"string\"},\"amount\":{\"type\":\"number\"}},\"required\":[\"user_email\",\"amount\"]}"
  }'
```
*Take note of the `"id"` returned in the JSON response (e.g., `1`).*

### Step 2: Execute the Workflow
Trigger an execution for the workflow you just created (assuming the ID is `1`).

```bash
curl -X POST http://localhost:8080/api/workflows/1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "triggeredBy": "admin_user",
    "data": "{\"user_email\":\"user@example.com\",\"amount\":150.00}"
  }'
```
*This returns an Execution object with an `"id"` parameter and a status of `PENDING`.*

### Step 3: Check Execution Status
Poll the execution ID to see its current status.

```bash
curl -X GET http://localhost:8080/api/executions/1
```
*Wait until the status changes to `COMPLETED`.*

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS, TypeScript, React Query
- **Backend:** Java, Spring Boot 3, Spring Web, Spring Data JPA
- **Database:** Internal Database (H2) or connected SQL DB
"# Halleyx-workflow-automation" 
"# Halleyx-workflow-automation"

Youtube Link 
https://youtu.be/c1Z0OM7YV5k?si=oCmDg-gHfl1Twfmb
