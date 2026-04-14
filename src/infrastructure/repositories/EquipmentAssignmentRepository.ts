import { IEquipmentAssignmentRepository } from '../../domain/repositories/IEquipmentAssignmentRepository'
import {
  EquipmentAssignmentEntity,
  CreateEquipmentAssignmentDTO,
  UpdateEquipmentAssignmentDTO,
} from '../../domain/entities/EquipmentAssignment'
import EquipmentAssignmentModel from '../database/models/EquipmentAssignmentModel'

export class EquipmentAssignmentRepository
  implements IEquipmentAssignmentRepository
{
  async findAll(): Promise<EquipmentAssignmentEntity[]> {
    return EquipmentAssignmentModel.findAll({ raw: true })
  }

  async findById(id: string): Promise<EquipmentAssignmentEntity | null> {
    const assignment = await EquipmentAssignmentModel.findByPk(id, {
      raw: true,
    })
    return assignment ?? null
  }

  async findByEquipmentId(
    equipmentId: string
  ): Promise<EquipmentAssignmentEntity[]> {
    return EquipmentAssignmentModel.findAll({
      where: { equipmentId },
      raw: true,
    })
  }

  async findByEmployeeId(
    employeeId: string
  ): Promise<EquipmentAssignmentEntity[]> {
    return EquipmentAssignmentModel.findAll({
      where: { employeeId },
      raw: true,
    })
  }

  async findActiveByEquipmentId(
    equipmentId: string
  ): Promise<EquipmentAssignmentEntity | null> {
    const assignment = await EquipmentAssignmentModel.findOne({
      where: { equipmentId, status: 'active' },
      raw: true,
    })
    return assignment ?? null
  }

  async create(
    data: CreateEquipmentAssignmentDTO
  ): Promise<EquipmentAssignmentEntity> {
    const assignment = await EquipmentAssignmentModel.create(
      data as EquipmentAssignmentEntity
    )
    return assignment.toJSON() as EquipmentAssignmentEntity
  }

  async update(
    id: string,
    data: UpdateEquipmentAssignmentDTO
  ): Promise<EquipmentAssignmentEntity | null> {
    const [affectedRows] = await EquipmentAssignmentModel.update(data, {
      where: { id },
    })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await EquipmentAssignmentModel.destroy({ where: { id } })
    return deleted > 0
  }
}
