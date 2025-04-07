import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateTaskDto {
  @ApiProperty({ example: 'send-email', description: 'Type of the task' })
  @IsString()
  type: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  priority?: number;
}

export class CreateTaskResponseDto {
  @ApiProperty({ example: 'Task created' })
  message: string;

  @ApiProperty({ example: '660ff6cbe9c8b1c8fcd12345' })
  id: string;
}

export class TaskStatusResponse {
  @ApiProperty({ example: 2 })
  pending: number

  @ApiProperty({ example: 2 })
  completed: number

  @ApiProperty({ example: 4 })
  processing: number

  @ApiProperty({ example: 3 })
  failed: number
}

export class TaskDetailsResponse {
  @ApiProperty({ example: "67f39f4b28af80dde28ee47ae" })
  _id: string

  @ApiProperty({ example: "send-mail" })
  type: string

  @ApiProperty({ example: "completed" })
  status: string

  @ApiProperty({ example: 2 })
  attempts: number

  @ApiProperty({ example: "2025-04-07T09:47:55.119Z" })
  createdAt: string

  @ApiProperty({ example: "2025-04-07T09:47:55.119Z" })
  updatedAt: string
}
