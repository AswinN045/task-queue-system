import { Injectable, Logger, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/tasks.schema';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';

@Injectable()
export class TaskService {
    private readonly logger = new Logger(TaskService.name);

    constructor(@InjectModel(Task.name) private taskModel: Model<TaskDocument>) { }

    async createTask(dto: CreateTaskDto): Promise<TaskDocument> {
        try {
            const task = new this.taskModel({
                type: dto.type,
                priority: dto.priority ?? 0
            });
            await task.save();
            return task;
        } catch (error) {
            throw new InternalServerErrorException('Failed to create task');
        }
    }

    async getStatusCounts(): Promise<Record<string, number>> {
        try {
            const counts = await this.taskModel.aggregate([
                { $group: { _id: '$status', count: { $sum: 1 } } },
            ]);
            return counts.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {} as Record<string, number>);
        } catch (error) {
            throw new InternalServerErrorException('Failed to fetch status counts');
        }
    }

    async getTaskById(id: string): Promise<Task> {
        const task = await this.taskModel.findById(id);
        if (!task) {
            throw new NotFoundException('Task not found');
        }
        return task;
    }

    async fetchPendingTasks(limit = 5): Promise<TaskDocument[]> {
        return this.taskModel.find({ status: TaskStatus.PENDING, attempts: { $lt: 3 } }).sort({ priority: -1 }).limit(limit);
    }

    async updateStatus(task: TaskDocument, status: TaskStatus, errorMessage?: string): Promise<TaskDocument> {
        task.status = status;
        if (errorMessage) {
            task.errorMessage = errorMessage;
        }
        return await task.save();
    }

    async incrementAttempts(task: TaskDocument): Promise<TaskDocument> {
        task.attempts += 1;
        return await task.save();
    }
}
