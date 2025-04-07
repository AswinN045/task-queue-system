import { Test, TestingModule } from '@nestjs/testing';
import { TaskService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Task, TaskDocument, TaskStatus } from './schemas/tasks.schema';
import { Model } from 'mongoose';
import { CreateTaskDto } from './dto/create-task.dto';
import { NotFoundException, InternalServerErrorException } from '@nestjs/common';

describe('TaskService', () => {
  let service: TaskService;
  let model: jest.Mocked<Model<TaskDocument>>;

  const mockTask = {
    _id: '123',
    type: 'test',
    status: TaskStatus.PENDING,
    attempts: 0,
    save: jest.fn().mockResolvedValue(true),
  } as unknown as TaskDocument;

  const taskArray = [mockTask];

  beforeEach(async () => {
    const mockModel: Partial<jest.Mocked<Model<TaskDocument>>> = {
      findById: jest.fn().mockResolvedValue(mockTask),
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue(taskArray),
      } as any),
      aggregate: jest.fn().mockResolvedValue([{ _id: TaskStatus.PENDING, count: 1 }]),
    };

    const mockModelConstructor = jest.fn().mockImplementation(() => ({
      ...mockTask,
      save: jest.fn().mockResolvedValue(mockTask),
    }));

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskService,
        {
          provide: getModelToken(Task.name),
          useValue: Object.assign(mockModelConstructor, mockModel),
        },
      ],
    }).compile();

    service = module.get<TaskService>(TaskService);
    model = module.get(getModelToken(Task.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createTask', () => {
    it('should create and return a task', async () => {
      const dto: CreateTaskDto = { type: 'test' };
      const result = await service.createTask(dto);
      expect(result).toMatchObject({
        _id: '123',
        type: 'test',
        status: TaskStatus.PENDING,
        attempts: 0,
      });

    });

    it('should throw InternalServerErrorException on save failure', async () => {
      const errorModel = jest.fn().mockImplementation(() => ({
        save: jest.fn().mockRejectedValue(new Error('Save error')),
      }));

      const module: TestingModule = await Test.createTestingModule({
        providers: [
          TaskService,
          {
            provide: getModelToken(Task.name),
            useValue: errorModel,
          },
        ],
      }).compile();

      const errorService = module.get<TaskService>(TaskService);
      await expect(errorService.createTask({ type: 'fail' })).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getTaskById', () => {
    it('should return the task for a valid id', async () => {
      const result = await service.getTaskById('123');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task not found', async () => {
      model.findById.mockResolvedValueOnce(null);
      await expect(service.getTaskById('invalid')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getStatusCounts', () => {
    it('should return status count object', async () => {
      const result = await service.getStatusCounts();
      expect(result).toEqual({ [TaskStatus.PENDING]: 1 });
    });
  });

  describe('fetchPendingTasks', () => {
    it('should return array of pending tasks', async () => {
      const result = await service.fetchPendingTasks();
      expect(result).toEqual(taskArray);
    });
  });

  describe('updateStatus', () => {
    it('should update status and save the task', async () => {
      const task = {
        ...mockTask,
        save: jest.fn().mockResolvedValue(mockTask),
      } as unknown as TaskDocument;

      const result = await service.updateStatus(task, TaskStatus.COMPLETED);
      expect(task.save).toHaveBeenCalled();

    });
  });

  describe('incrementAttempts', () => {
    it('should increment attempts and save the task', async () => {
      const task = {
        ...mockTask,
        attempts: 0,
        save: jest.fn().mockResolvedValue(mockTask),
      } as unknown as TaskDocument;

      const result = await service.incrementAttempts(task);
      expect(task.attempts).toBe(1);
      expect(task.save).toHaveBeenCalled();

    });
  });
});
