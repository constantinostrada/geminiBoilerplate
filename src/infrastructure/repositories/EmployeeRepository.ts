import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository'
import {
  EmployeeEntity,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
} from '../../domain/entities/Employee'
import EmployeeModel from '../database/models/EmployeeModel'

export class EmployeeRepository implements IEmployeeRepository {
  async findAll(): Promise<EmployeeEntity[]> {
    return EmployeeModel.findAll({ raw: true })
  }

  async findById(id: string): Promise<EmployeeEntity | null> {
    const employee = await EmployeeModel.findByPk(id, { raw: true })
    return employee ?? null
  }

  async findByUserId(userId: string): Promise<EmployeeEntity | null> {
    const employee = await EmployeeModel.findOne({
      where: { userId },
      raw: true,
    })
    return employee ?? null
  }

  async findByEmployeeCode(code: string): Promise<EmployeeEntity | null> {
    const employee = await EmployeeModel.findOne({
      where: { employeeCode: code },
      raw: true,
    })
    return employee ?? null
  }

  async create(data: CreateEmployeeDTO): Promise<EmployeeEntity> {
    const employee = await EmployeeModel.create(data as EmployeeEntity)
    return employee.toJSON() as EmployeeEntity
  }

  async update(
    id: string,
    data: UpdateEmployeeDTO
  ): Promise<EmployeeEntity | null> {
    const [affectedRows] = await EmployeeModel.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await EmployeeModel.destroy({ where: { id } })
    return deleted > 0
  }
}
