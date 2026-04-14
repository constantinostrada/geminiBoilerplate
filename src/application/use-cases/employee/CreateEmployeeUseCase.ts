import { IEmployeeRepository } from '../../../domain/repositories/IEmployeeRepository'
import {
  CreateEmployeeDTO,
  EmployeeEntity,
} from '../../../domain/entities/Employee'

export class CreateEmployeeUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(data: CreateEmployeeDTO): Promise<EmployeeEntity> {
    const existing = await this.employeeRepository.findByEmployeeCode(
      data.employeeCode
    )
    if (existing) {
      throw new Error(
        `An employee with code '${data.employeeCode}' already exists.`
      )
    }

    return this.employeeRepository.create(data)
  }
}
