import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Task, TaskSchema } from './schemas/tasks.schema';
import { TaskService } from './tasks.service';
import { TaskController } from './tasks.controller';
import { TaskProcessor } from './tasks.processor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Task.name, schema: TaskSchema }])],
  controllers: [TaskController],
  providers: [TaskService, TaskProcessor],
})
export class TasksModule { }
