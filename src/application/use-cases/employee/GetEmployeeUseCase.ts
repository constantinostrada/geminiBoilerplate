import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository'
import { EmployeeEntity } from '../../../domain/entities/Employee'

export class GetAllEmployeesUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(): Promise<EmployeeEntity[]> {
    return this.employeeRepository.findAll()
  }
}

export class GetEmployeeByIdUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(id: string): Promise<EmployeeEntity> {
    const employee = await this.employeeRepository.findById(id)
    if (!employee) throw new Error(`Employee with id '${id}' not found.`)
    return employee
  }
}
