import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";

export function ExecutionMonitor({ executionId }) {
  const [updates, setUpdates] = useState([]);
  const [tasks, setTasks] = useState({});

  useEffect(() => {
    // Connect to the Socket.IO server
    const socket = io('http://localhost:3001'); // Ensure this matches your server URL

    // Listen for status updates
    socket.on('status-change', (update) => {
      setUpdates(prev => [...prev, update]);
      setTasks(prev => ({
        ...prev,
        [update.taskId]: update
      }));
    });

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, [executionId]);

  return (
    <div className="monitor-container">
      <h3>Workflow Execution: {executionId}</h3>
      <div className="status-grid">
        {Object.entries(tasks).map(([taskId, task]) => (
          <div key={taskId} className={`status-card ${task.status}`}>
            <div className="task-header">
              <span>Task {taskId}</span>
              <span className="status-badge">{task.status}</span>
            </div>
            {task.output && (
              <div className="task-output">
                <pre>{JSON.stringify(task.output, null, 2)}</pre>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}