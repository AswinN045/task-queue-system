import { Test, TestingModule } from '@nestjs/testing';
import { TaskController } from './tasks.controller';
import { TaskService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from './schemas/tasks.schema';

describe('TaskController', () => {
  let controller: TaskController;
  let service: TaskService;

  const mockTaskService = {
    createTask: jest.fn(),
    getStatusCounts: jest.fn(),
    getTaskById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TaskController],
      providers: [
        {
          provide: TaskService,
          useValue: mockTaskService,
        },
      ],
    }).compile();

    controller = module.get<TaskController>(TaskController);
    service = module.get<TaskService>(TaskService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createTask', () => {
    it('should create a task and return message and id', async () => {
      const dto: CreateTaskDto = { type: 'send-email', priority: 1 };
      const mockTask = { _id: 'abc123', type: 'send-email' };
      mockTaskService.createTask.mockResolvedValue(mockTask);
      const result = await controller.create(dto);
      expect(result).toEqual({
        message: 'Task created',
        id: 'abc123',
      });
      expect(mockTaskService.createTask).toHaveBeenCalledWith(dto);
    });
  });

  describe('getStatusCounts', () => {
    it('should return task counts by status', async () => {
      const mockCounts = { PENDING: 2, PROCESSING: 1 };
      mockTaskService.getStatusCounts.mockResolvedValue(mockCounts);

      const result = await controller.getStatus();
      expect(result).toEqual(mockCounts);
    });
  });

  describe('getTaskById', () => {
    it('should return the task for a valid id', async () => {
      const mockTask = { _id: 'task1', type: 'send-email', status: TaskStatus.PENDING };
      mockTaskService.getTaskById.mockResolvedValue(mockTask);

      const result = await controller.getTask('task1');
      expect(result).toEqual(mockTask);
    });

    it('should return not found message for invalid id', async () => {
      mockTaskService.getTaskById.mockResolvedValue({ message: 'task not fond' });

      const result = await controller.getTask('invalidId');
      expect(result).toEqual({ message: 'task not fond' });
    });
  });
});
