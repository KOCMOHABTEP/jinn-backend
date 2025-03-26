import { BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Employee {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ nullable: true })
  middleName?: string;

  @ManyToOne(() => Employee, (employee) => employee.subordinates, { nullable: true })
  @JoinColumn({ name: 'managerId' }) // Определяем внешний ключ
  manager: Employee;

  @Column({ nullable: true })
  managerId: number;
}
