import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from './tasks.service';
import { TaskStatus } from './schemas/tasks.schema';

@Injectable()
export class TaskProcessor {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(private taskService: TaskService) { }

  @Cron(CronExpression.EVERY_MINUTE)
  async handleCron() {
    this.logger.log('Running task processor...');

    const tasks = await this.taskService.fetchPendingTasks(5);

    for (const task of tasks) {
      try {
        await this.taskService.updateStatus(task, TaskStatus.PROCESSING);

        await this.simulateTask(task.type);

        await this.taskService.updateStatus(task, TaskStatus.COMPLETED);
        this.logger.log(`Task ${task._id} completed`);
      } catch (err) {
        await this.taskService.incrementAttempts(task);

        if (task.attempts >= 3) {
          await this.taskService.updateStatus(task, TaskStatus.FAILED, err.message);
          this.logger.error(`Task ${task._id} failed after 3 attempts`);
        } else {
          await this.taskService.updateStatus(task, TaskStatus.PENDING);
          this.logger.warn(`Task ${task._id} failed. Retrying (attempt ${task.attempts})`);
        }
      }
    }
  }

  private async simulateTask(type: string): Promise<void> {
    await new Promise((res, rej) => {
      setTimeout(() => {
        Math.random() < 0.7 ? res(true) : rej(new Error('Simulated task failure'));
      }, 1000);
    });
  }
}
