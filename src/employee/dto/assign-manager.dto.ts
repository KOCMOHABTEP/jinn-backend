import { IsNumber, IsOptional } from 'class-validator';

export class AssignManagerDto {
  @IsNumber()
  employeeId: number;

  @IsNumber()
  @IsOptional()
  managerId: number | null;
}
