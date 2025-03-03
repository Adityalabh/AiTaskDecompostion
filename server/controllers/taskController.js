import { decomposeTask, validateSubtasks } from '../services/decompositionService.js';
import { createAgents } from '../services/agentService.js';
import { WorkflowEngine } from '../services/workflowEngine.js';

export const handleDecomposition = async (req, res) => {
  try {
    const { task: mainTask } = req.body;
    
    if (!mainTask) {
      return res.status(400).json({ error: "Task description is required" });
    }

    const jsonString = await decomposeTask(mainTask);
    const subtasks = JSON.parse(jsonString);
    const validatedSubtasks = validateSubtasks(subtasks, mainTask);
    const agents = createAgents(validatedSubtasks);

    res.json({ subtasks: validatedSubtasks, agents });
    
  } catch (error) {
    console.error("Decomposition error:", error);
    res.status(500).json({
      error: "Failed to decompose task",
      details: error.message
    });
  }
};

export const startExecution = async (req, res) => {
  try {
    const { subtasks, agents } = req.body;
    const workflow = new WorkflowEngine(subtasks, agents, req.app.get('io'));
    
    // Set up event listeners
    workflow
    .on('task-start', ({ taskId, agent }) => 
      console.log(`Task ${taskId} started by ${agent.id}`))
    .on('task-success', ({ taskId }) => 
      console.log(`Task ${taskId} completed`))
    .on('task-retry', ({ taskId, attempt }) => 
      console.log(`Retrying task ${taskId} (attempt ${attempt})`))
    .on('critical-error', ({ taskId, error }) => 
      console.error(`Critical error in ${taskId}: ${error}`));

    await workflow.startExecution();
    
    res.json({ 
      message: 'Workflow started',
      executionId: workflow.executionId
    });
  } catch (error) {
    res.status(500).json({ error: 'Workflow initialization failed', details: error.message });
  }
};