import React from "react";

export function SubtaskList({ subtasks }) {
  
  // Groups subtasks by their parallel_group.
  // This allows you to display tasks in sequential and parallel groups separately.
  const groupTasks = subtasks.reduce((acc, task) => {
    const group = task.parallel_group || 0;
    if (!acc[group]) acc[group] = [];
    acc[group].push(task);
    return acc;
  }, {});

  // Provides a human-readable title for each group of tasks.
  // Helps users understand which tasks are sequential and which are parallel.
  const getGroupTitle = (groupId) => {
    if (groupId === 0) return "Sequential Tasks";
    return `Parallel Group ${groupId}`;
  };

  // Formats the dependencies text for display.
  // Handles cases where there are no dependencies.
  
  const getDependencyText = (dependencies) => {
    if (!dependencies || dependencies.length === 0) return "No dependencies";
    return `Depends on: ${dependencies.join(", ")}`;
  }

  return (
    <div className="mt-8 space-y-8">
    {Object.entries(groupTasks).map(([groupId, tasks]) => (
      <div key={groupId} className="group-container">
        <div className="group-header mb-4 pb-2 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">
            {getGroupTitle(Number(groupId))}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({tasks.length} tasks)
            </span>
          </h3>
          {tasks[0]?.context && (
            <p className="mt-1 text-sm text-gray-600">
              Context: {tasks[0].context}
            </p>
          )}
        </div>

        <div className={`tasks-grid ${
          groupId !== '0' ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'
        }`}>
          {tasks.map((task) => (
            <div
              key={task.id}
              className="task-card p-4 bg-white rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-blue-700">Task #{task.id}</span>
                    {task.parallel_group !== 0 && (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                        Parallel
                      </span>
                    )}
                  </div>
                  <p className="text-gray-800">{task.description}</p>
                </div>
              </div>
              
              <div className="mt-3 pt-2 border-t border-gray-100">
                <div className="text-sm text-gray-600">
                  {getDependencyText(task.dependencies)}
                </div>
                {task.dependencies?.length > 0 && (
                  <div className="mt-1 text-xs text-gray-500">
                    Must complete: {task.dependencies.join(", ")}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
  );
}
