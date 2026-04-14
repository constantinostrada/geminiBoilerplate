import { IEquipmentRepository } from '../../domain/repositories/IEquipmentRepository'
import {
  EquipmentEntity,
  CreateEquipmentDTO,
  UpdateEquipmentDTO,
} from '../../domain/entities/Equipment'
import EquipmentModel from '../database/models/EquipmentModel'

export class EquipmentRepository implements IEquipmentRepository {
  async findAll(): Promise<EquipmentEntity[]> {
    return EquipmentModel.findAll({ raw: true })
  }

  async findById(id: string): Promise<EquipmentEntity | null> {
    const equipment = await EquipmentModel.findByPk(id, { raw: true })
    return equipment ?? null
  }

  async findBySerialNumber(
    serialNumber: string
  ): Promise<EquipmentEntity | null> {
    const equipment = await EquipmentModel.findOne({
      where: { serialNumber },
      raw: true,
    })
    return equipment ?? null
  }

  async create(data: CreateEquipmentDTO): Promise<EquipmentEntity> {
    const equipment = await EquipmentModel.create(data as EquipmentEntity)
    return equipment.toJSON() as EquipmentEntity
  }

  async update(
    id: string,
    data: UpdateEquipmentDTO
  ): Promise<EquipmentEntity | null> {
    const [affectedRows] = await EquipmentModel.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await EquipmentModel.destroy({ where: { id } })
    return deleted > 0
  }
}
