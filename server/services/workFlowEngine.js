import EventEmitter from 'events';

// Global counter for execution IDs
let executionCounter = 0;

const TaskStatus = {
  PENDING: 'pending',
  READY: 'ready',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed'
};

export class WorkflowEngine extends EventEmitter {
  constructor(subtasks, agents,io) {
    super();
    this.io = io; 
    this.executionId = (executionCounter++).toString();
    this.subtasks = this.initializeTasks(subtasks);
    this.agents = new Map(agents.map(a => [a.taskId, a]));
    this.dependencyGraph = this.buildDependencyGraph();
    this.parallelGroups = this.groupByParallel();
    this.retryLimits = new Map();
  }

  initializeTasks(tasks) {
    return new Map(tasks.map(task => [
      task.id,
      {
        ...task,
        status: TaskStatus.PENDING,
        dependencies: new Set(task.dependencies),
        dependents: new Set(),
        output: null,
        attempts: 0
      }
    ]));
  }

  buildDependencyGraph() {
    const graph = new Map();
    this.subtasks.forEach((task, taskId) => {
      task.dependencies.forEach(depId => {
        if (!this.subtasks.has(depId)) {
          throw new Error(`Invalid dependency ${depId} for task ${taskId}`);
        }
        this.subtasks.get(depId).dependents.add(taskId);
      });
    });
    return graph;
  }

  groupByParallel() {
    const groups = new Map();
    this.subtasks.forEach(task => {
      const group = task.parallel_group || 0;
      if (!groups.has(group)) groups.set(group, new Set());
      groups.get(group).add(task.id);
    });
    return groups;
  }

  async startExecution() {
    this.emit('workflow-start', { executionId: this.executionId });
    this.updateTaskStates();
    this.scheduleTasks();
  }

  updateTaskStates() {
    this.subtasks.forEach(task => {
      if (task.status === TaskStatus.PENDING && 
          this.isTaskReady(task.id)) {
        this.setTaskStatus(task.id, TaskStatus.READY);
      }
    });
  }

  isTaskReady(taskId) {
    const task = this.subtasks.get(taskId);
    return Array.from(task.dependencies).every(depId => 
      this.subtasks.get(depId).status === TaskStatus.COMPLETED
    );
  }

  async scheduleTasks() {
    const executableTasks = Array.from(this.subtasks.values())
      .filter(task => task.status === TaskStatus.READY);

    // Process parallel groups first
    const parallelGroups = new Set();
    executableTasks.forEach(task => {
      if (task.parallel_group !== 0) {
        parallelGroups.add(task.parallel_group);
      }
    });

    // Execute parallel groups
    for (const groupId of parallelGroups) {
      const groupTasks = Array.from(this.parallelGroups.get(groupId))
        .filter(id => this.subtasks.get(id).status === TaskStatus.READY);
      
      await Promise.allSettled(
        groupTasks.map(taskId => this.executeTask(taskId))
      );
    }

    // Execute sequential tasks
    executableTasks
      .filter(task => task.parallel_group === 0)
      .forEach(task => this.executeTask(task.id));
  }

  async executeTask(taskId) {
    const task = this.subtasks.get(taskId);
    const agent = this.agents.get(taskId);

    try {
      this.setTaskStatus(taskId, TaskStatus.RUNNING);
      this.emit('task-start', { taskId, agent });

      // Simulate task execution - replace with actual agent execution
      const result = await this.simulateAgentExecution(task, agent);
      
      this.setTaskStatus(taskId, TaskStatus.COMPLETED, result);
      this.emit('task-success', { taskId, result });
      this.updateDependents(taskId);
    } catch (error) {
      this.handleTaskFailure(taskId, error);
    }
  }

  async simulateAgentExecution(task, agent) {
    // Replace with actual agent execution logic
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (Math.random() < 0.2) { // 20% failure rate for simulation
          reject(new Error('Simulated agent failure'));
        } else {
          resolve({ output: `Result for ${task.description}` });
        }
      }, Math.random() * 2000);
    });
  }

  handleTaskFailure(taskId, error) {
    const task = this.subtasks.get(taskId);
    task.attempts++;

    if (task.attempts >= (this.retryLimits.get(taskId) || 3)) {
      this.setTaskStatus(taskId, TaskStatus.FAILED, error);
      this.emit('task-failure', { taskId, error });
      this.emit('critical-error', { 
        taskId,
        error: `Task failed after ${task.attempts} attempts`
      });
    } else {
      this.setTaskStatus(taskId, TaskStatus.PENDING);
      this.emit('task-retry', { taskId, attempt: task.attempts });
      this.scheduleTasks();
    }
  }

  updateDependents(taskId) {
    const dependents = this.subtasks.get(taskId).dependents;
    dependents.forEach(dependentId => {
      if (this.isTaskReady(dependentId)) {
        this.setTaskStatus(dependentId, TaskStatus.READY);
      }
    });
    this.scheduleTasks();
  }

  setTaskStatus(taskId, status, data = null) {
    const task = this.subtasks.get(taskId);
    task.status = status;
    if (data) task.output = data;
  
    // Emit status change to the client
    this.emit('status-change', { taskId, status, data });
  
    // Broadcast to all connected clients
    if (this.io) {
      this.io.emit('status-change', { taskId, status, data });
    }
  }
}