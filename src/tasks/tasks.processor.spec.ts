import { Test, TestingModule } from '@nestjs/testing';
import { TaskProcessor } from './tasks.processor';
import { TaskService } from './tasks.service';
import { TaskStatus, TaskDocument } from './schemas/tasks.schema';
import { Logger } from '@nestjs/common';

describe('TaskProcessor', () => {
    let processor: TaskProcessor;
    let taskService: jest.Mocked<TaskService>;

    const mockTask = {
        _id: '123',
        type: 'test',
        status: TaskStatus.PENDING,
        attempts: 0,
        save: jest.fn().mockResolvedValue(true),
    } as Partial<TaskDocument> as TaskDocument;


    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TaskProcessor,
                {
                    provide: TaskService,
                    useValue: {
                        fetchPendingTasks: jest.fn(),
                        updateStatus: jest.fn(),
                        incrementAttempts: jest.fn(),
                    },
                },
            ],
        }).compile();

        processor = module.get<TaskProcessor>(TaskProcessor);
        taskService = module.get(TaskService);
        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => { });
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => { });
    });

    describe('handleCron', () => {
        it('should process and complete tasks successfully', async () => {
            taskService.fetchPendingTasks.mockResolvedValue([mockTask]);
            taskService.updateStatus.mockResolvedValue(mockTask);

            jest.spyOn<any, any>(processor, 'simulateTask').mockResolvedValue(true);

            await processor.handleCron();

            expect(taskService.fetchPendingTasks).toHaveBeenCalledWith(5);
            expect(taskService.updateStatus).toHaveBeenCalledWith(mockTask, TaskStatus.PROCESSING);
            expect(taskService.updateStatus).toHaveBeenCalledWith(mockTask, TaskStatus.COMPLETED);
        });

        it('should retry a task and mark it as failed after 3 attempts', async () => {
            const failedTask = { ...mockTask, attempts: 2 } as Partial<TaskDocument> as TaskDocument;;
            taskService.fetchPendingTasks.mockResolvedValue([failedTask]);
            taskService.updateStatus.mockResolvedValue(failedTask);
            taskService.incrementAttempts.mockImplementation(async (task) => {
                task.attempts += 1;
                return task;
            });

            jest.spyOn<any, any>(processor, 'simulateTask').mockRejectedValue(new Error('Fail'));

            await processor.handleCron();

            expect(taskService.updateStatus).toHaveBeenCalledWith(failedTask, TaskStatus.PROCESSING);
            expect(taskService.incrementAttempts).toHaveBeenCalled();
            expect(taskService.updateStatus).toHaveBeenCalledWith(
                expect.objectContaining({ attempts: 3 }),
                TaskStatus.FAILED,
                'Fail'
            );
        });

        it('should retry a task and set it back to pending if attempts < 3', async () => {
            const retryTask = {
                ...mockTask,
                attempts: 1,
            } as Partial<TaskDocument> as TaskDocument;

            taskService.fetchPendingTasks.mockResolvedValue([retryTask]);
            taskService.updateStatus.mockResolvedValue(retryTask);
            taskService.incrementAttempts.mockImplementation(async (task) => {
                task.attempts += 1;
                return task;
            });

            jest.spyOn<any, any>(processor, 'simulateTask').mockRejectedValue(new Error('Fail Again'));

            await processor.handleCron();

            expect(taskService.updateStatus).toHaveBeenCalledWith(retryTask, TaskStatus.PROCESSING);
            expect(taskService.incrementAttempts).toHaveBeenCalled();
            expect(taskService.updateStatus).toHaveBeenCalledWith(
                expect.objectContaining({ attempts: 2 }),
                TaskStatus.PENDING
            );
        });
    });
});
