import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { EmployeeService } from './employee.service';
import { CreateEmployeeDto } from '@/employee/dto/create-employee.dto';
import { AssignManagerDto } from '@/employee/dto/assign-manager.dto';

@Controller('employees')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}

  @Post()
  @UsePipes(new ValidationPipe())
  async createEmployee(@Body() createEmployeeDto: CreateEmployeeDto) {
    return this.employeeService.createEmployee(createEmployeeDto);
  }

  @Post('assign-manager')
  @UsePipes(new ValidationPipe())
  async assignManager(@Body() assignManagerDto: AssignManagerDto) {
    return this.employeeService.assignManager(assignManagerDto);
  }

  @Delete(':id')
  async deleteEmployee(@Param('id') id: number) {
    return this.employeeService.deleteEmployee(id);
  }

  @Get()
  async getAllEmployees() {
    return this.employeeService.getAllEmployees();
  }

  @Get('tree-structure')
  async getEmployeesTreeStructure() {
    return this.employeeService.getEmployeesTreeStructure();
  }
}
