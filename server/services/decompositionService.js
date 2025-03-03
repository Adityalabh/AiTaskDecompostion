
// Deconposition services
import dotenv from 'dotenv';
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const apiKey = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "models/gemini-1.5-flash-002" });

export const decomposeTask = async (mainTask) => {
  const decompositionPrompt = `
  Analyze and decompose the following task into clear, actionable sub-tasks.
  Return a JSON array containing objects with these fields:
  - id: unique identifier (number)
  - description: task description
  - dependencies: array of IDs this task depends on
  - parallel_group: number indicating which tasks can run concurrently (0 for sequential)
  - context: the original main task being decomposed ("${mainTask}")

  Rules:
  1. Tasks in the same parallel group MUST NOT depend on each other.
  2. Tasks in parallel groups can only depend on tasks in sequential groups (parallel_group = 0).
  3. Sequential tasks (parallel_group = 0) can depend on other sequential tasks.

  Task to decompose: ${mainTask}
`;

  const result = await model.generateContent(decompositionPrompt);
  const responseText = result.response.text();
  return responseText.replace(/```json|```/g, '');
};

export const validateSubtasks = (subtasks, mainTask) => {
  const taskIds = subtasks.map(task => task.id);
  const groups = new Map();

  // Validate dependencies and parallel groups
  subtasks.forEach(task => {
    task.dependencies = task.dependencies || [];
    task.dependencies = task.dependencies.filter(dep => taskIds.includes(dep));
    task.parallel_group = task.parallel_group || 0;
    task.context = mainTask;

    const group = task.parallel_group;
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group).push(task.id);
  });

  // Check for dependencies within parallel groups
  groups.forEach((members, groupId) => {
    if (groupId === 0) return; // Skip sequential tasks

    members.forEach(taskId => {
      const task = subtasks.find(t => t.id === taskId);
      if (task.dependencies.some(dep => members.includes(dep))) {
        throw new Error(`Parallel group ${groupId} contains dependent tasks`);
      }
    });
  });

  return subtasks;
};