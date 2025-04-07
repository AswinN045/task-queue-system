import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { TaskService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CreateTaskResponseDto, TaskStatusResponse, TaskDetailsResponse } from './dto/create-task.dto';

@ApiTags('Tasks')
@Controller('tasks')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new task' })
    @ApiResponse({ status: 201, description: "Task created", type: CreateTaskResponseDto })
    async create(@Body() dto: CreateTaskDto) {
        try {
            const task = await this.taskService.createTask(dto);
            return { message: "Task created", id: task._id }
        }
        catch (error) {
            return error;
        }
    }

    @Get('status')
    @ApiOperation({ summary: 'Get count of tasks grouped by status' })
    @ApiResponse({ status: 200, description: "Get count of tasks", type: TaskStatusResponse })
    getStatus() {
        return this.taskService.getStatusCounts();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get task details by ID' })
    @ApiParam({ name: 'id', type: String })
    @ApiResponse({ status: 200, description: "Task details", type: TaskDetailsResponse })
    getTask(@Param('id') id: string) {
        return this.taskService.getTaskById(id);
    }
}
