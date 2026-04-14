import {
  EmployeeEntity,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
} from '../entities/Employee'

export interface IEmployeeRepository {
  findAll(): Promise<EmployeeEntity[]>
  findById(id: string): Promise<EmployeeEntity | null>
  findByUserId(userId: string): Promise<EmployeeEntity | null>
  findByEmployeeCode(code: string): Promise<EmployeeEntity | null>
  create(data: CreateEmployeeDTO): Promise<EmployeeEntity>
  update(id: string, data: UpdateEmployeeDTO): Promise<EmployeeEntity | null>
  delete(id: string): Promise<boolean>
}
