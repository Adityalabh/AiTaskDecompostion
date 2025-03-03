
// agent creation
export const createAgents = (subtasks) => {
    return subtasks.map((subtask, index) => ({
        id: `agent-${index + 1}`,
        taskId: subtask.id,
        status: "idle",
        subtask: subtask,
    }));
};