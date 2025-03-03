import React from "react";

export function AgentList({ agents }) {
  return (
    <div className="mt-8 space-y-6">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className="agent-card p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-blue-700">Agent {agent.id}</span>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${
                    agent.status === "idle"
                      ? "bg-gray-100 text-gray-800"
                      : agent.status === "executing"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-green-100 text-green-800"
                  }`}
                >
                  {agent.status}
                </span>
              </div>
              <p className="text-gray-800">{agent.subtask.description}</p>
              <p className="mt-2 text-sm text-gray-600">
                <span className="font-semibold">Context:</span> {agent.subtask.context}
              </p>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              {agent.subtask.dependencies.length > 0
                ? `Depends on: ${agent.subtask.dependencies.join(", ")}`
                : "No dependencies"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}