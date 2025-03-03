import axios from "axios";
import React, { useState } from "react";
import { SubtaskList } from "./components/SubTasks";
import { AgentList } from "./components/AgentList";
import { ExecutionMonitor } from "./components/ExecutionMonitor";

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.withCredentials = true;

export default function App() {
  const [mainTask, setMainTask] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [executionId, setExecutionId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/api/decompose", { task: mainTask });
      setSubtasks(response.data.subtasks);
      setAgents(response.data.agents);

      // Start execution
      const executionResponse = await axios.post("/api/execute", {
        subtasks: response.data.subtasks,
        agents: response.data.agents
      });
      setExecutionId(executionResponse.data.executionId);
    } catch (error) {
      setError(error.response?.data?.details || "Failed to decompose task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">Task Orchestration System</h1>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Enter main task:</label>
            <textarea
              value={mainTask}
              onChange={(e) => setMainTask(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="3"
              placeholder="e.g. Create a marketing campaign for new product launch"
              minLength="20"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? "Decomposing..." : "Decompose Task"}
          </button>
          {error && <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">⚠️ {error}</div>}
        </form>

        {subtasks.length > 0 && (
          <>
            <SubtaskList subtasks={subtasks} />
            <AgentList agents={agents} />
          </>
        )}

        {executionId && <ExecutionMonitor executionId={executionId} />}
      </div>
    </div>
  );
}