import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Employee } from '@/employee/employee.entity';
import { CreateEmployeeDto } from '@/employee/dto/create-employee.dto';
import { AssignManagerDto } from '@/employee/dto/assign-manager.dto';

type TEmployeesTree = Employee & { subordinates: any[] };

@Injectable()
export class EmployeeService {
  constructor(
    @InjectRepository(Employee)
    private readonly employeeRepository: Repository<Employee>,
  ) {}

  async createEmployee(
    createEmployeeDto: CreateEmployeeDto,
  ): Promise<Employee> {
    const { managerId } = createEmployeeDto;

    const employee = this.employeeRepository.create(createEmployeeDto);

    let manager: Employee;

    if (managerId) {
      manager = await this.employeeRepository.findOneBy({ id: managerId });
      if (!manager) {
        throw new NotFoundException('Руководитель не найден');
      }

      employee.managerId = manager.id;
    }

    return this.employeeRepository.save(employee);
  }

  async assignManager(assignManagerDto: AssignManagerDto): Promise<Employee> {
    const { employeeId, managerId } = assignManagerDto;
    console.log(assignManagerDto);

    const employee = await this.employeeRepository.findOneBy({
      id: employeeId,
    });

    if (!employee) {
      throw new NotFoundException('Сотрудник не найден');
    }

    if (managerId) {
      const manager = await this.employeeRepository.findOneBy({
        id: managerId,
      });
      employee.managerId = manager.id;
    } else {
      employee.managerId = null;
    }

    return this.employeeRepository.save(employee);
  }

  async deleteEmployee(id: number): Promise<void> {
    const employee = await this.employeeRepository.findOne({
      where: { id },
    });

    if (!employee) {
      throw new NotFoundException('Сотрудник не найден');
    }

    const employeesWithThisManager = await this.employeeRepository.find({
      where: { managerId: id },
    });

    for (const emp of employeesWithThisManager) {
      emp.managerId = null;
      await this.employeeRepository.save(emp);
    }

    await this.employeeRepository.delete(id);
  }

  async getAllEmployees(): Promise<Employee[]> {
    return this.employeeRepository.find();
  }

  async getEmployeesTreeStructure(): Promise<Employee[]> {
    const employees = await this.employeeRepository.find();

    const employeesMap = new Map<number, TEmployeesTree>();

    employees.forEach((employee) => {
      employeesMap.set(employee.id, { ...employee, subordinates: [] });
    });

    const tree: TEmployeesTree[] = [];

    employees.forEach((employee) => {
      if (employee.managerId) {
        const manager = employeesMap.get(employee.managerId);
        if (manager) {
          manager.subordinates.push(employeesMap.get(employee.id));
        }
      } else {
        tree.push(employeesMap.get(employee.id));
      }
    });

    return tree;
  }
}
