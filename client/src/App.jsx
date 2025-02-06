import axios from "axios";
import "./App.css";
import React, { useState } from "react";

axios.defaults.baseURL = "http://localhost:3000";
axios.defaults.withCredentials = true;

 export default function App() {
  const [mainTask, setMainTask] = useState("");
  const [subtasks, setSubtasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post("/decompose", { task: mainTask });
      setSubtasks(response.data.subtasks);
    } catch (error) {
      setError(error.response?.data?.error || "Failed to decompose task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-200 min-h-screen p-8">
      <div className="max-w-2xl mx-auto">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-lg shadow-md"
        >
          <h1 className="text-2xl font-bold mb-4">Task Decomposition</h1>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              Enter main task:
            </label>
            <textarea
              value={mainTask}
              onChange={(e) => setMainTask(e.target.value)}
              className="w-full p-2 border rounded-md"
              rows="3"
              placeholder="e.g. Create a marketing campaign for new product launch"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Decomposing..." : "Decompose Task"}
          </button>

          {error && <div className="mt-4 text-red-600">{error}</div>}
        </form>

        {subtasks.length > 0 && (
          <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Decomposed Subtasks</h2>
            <div className="space-y-4">
              {subtasks.map((subtask, index) => (
                <div 
                  key={subtask.id || index}
                  className="p-4 bg-gray-50 rounded-md border-l-4 border-blue-600"
                >
                  <span className="font-medium">Subtask {index + 1}:</span>
                  <p className="mt-1 text-gray-700">{subtask.description}</p>
                </div>
              ))}

              {/* <div className="p-4 bg-gray-50 rounded-md border-l-4 border-blue-600  pb-9">
                <span className="font-medium">Subtask 1</span>
                <p className="mt-1 text-gray-700">
                  Identify the scope of 'self'.
                </p>
                <span className="font-medium">Subtask 2:</span>
                <p className="mt-1 text-gray-700">
                  Gather information about my capabilities and limitations.
                </p>
                <span className="font-medium">Subtask 3:</span>
                <p className="mt-1 text-gray-700">
                  Describe my purpose and function.
                </p>
                <span className="font-medium">Subtask 4:</span>
                <p className="mt-1 text-gray-700">
                  Explain my training data and knowledge base.
                </p>
                <span className="font-medium">Subtask 5:</span>
                <p className="mt-1 text-gray-700">
                  Outline my strengths and weaknesses.
                </p>
                <span className="font-medium">Subtask 6:</span>
                <p className="mt-1 text-gray-700">
                  Formulate a concise and informative response.
                </p>
                <span className="font-medium">Subtask 7:</span>
                <p className="mt-1 text-gray-700">
                  Deliver the response in a clear and understandable manner.
                </p>
              </div> */}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
