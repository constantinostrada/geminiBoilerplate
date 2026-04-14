import { IVacationRequestRepository } from '../../domain/repositories/IVacationRequestRepository'
import {
  VacationRequestEntity,
  CreateVacationRequestDTO,
  UpdateVacationRequestDTO,
} from '../../domain/entities/VacationRequest'
import VacationRequestModel from '../database/models/VacationRequestModel'

export class VacationRequestRepository implements IVacationRequestRepository {
  async findAll(): Promise<VacationRequestEntity[]> {
    return VacationRequestModel.findAll({ raw: true })
  }

  async findById(id: string): Promise<VacationRequestEntity | null> {
    const request = await VacationRequestModel.findByPk(id, { raw: true })
    return request ?? null
  }

  async findByEmployeeId(
    employeeId: string
  ): Promise<VacationRequestEntity[]> {
    return VacationRequestModel.findAll({
      where: { employeeId },
      raw: true,
    })
  }

  async create(
    data: CreateVacationRequestDTO
  ): Promise<VacationRequestEntity> {
    const request = await VacationRequestModel.create(
      data as VacationRequestEntity
    )
    return request.toJSON() as VacationRequestEntity
  }

  async update(
    id: string,
    data: UpdateVacationRequestDTO
  ): Promise<VacationRequestEntity | null> {
    const [affectedRows] = await VacationRequestModel.update(data, {
      where: { id },
    })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await VacationRequestModel.destroy({ where: { id } })
    return deleted > 0
  }
}
