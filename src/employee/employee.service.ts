import {
  BadRequestException,
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
    return this.employeeRepository.manager.transaction(async (transactionalEntityManager) => {
      const employee = transactionalEntityManager.create(Employee, createEmployeeDto);
      return transactionalEntityManager.save(employee);
    });
  }

  async assignManager(assignManagerDto: AssignManagerDto): Promise<Employee> {
    const { employeeId, managerId } = assignManagerDto;

    if (employeeId === managerId) {
      throw new BadRequestException(
        'Сотрудник не может быть рукводителем сам у себя',
      );
    }

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

    await this.employeeRepository.manager.transaction(async (transactionalEntityManager) => {
      const employeesWithThisManager = await transactionalEntityManager.find(Employee, {
        where: { managerId: id },
      });

      for (const emp of employeesWithThisManager) {
        emp.managerId = null;
      }

      if (employeesWithThisManager.length > 0) {
        await transactionalEntityManager.save(employeesWithThisManager);
      }

      await transactionalEntityManager.delete(Employee, id);
    });
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
