import { IEquipmentRepository } from '../../../domain/repositories/IEquipmentRepository'
import {
  CreateEquipmentDTO,
  EquipmentEntity,
} from '../../../domain/entities/Equipment'

export class CreateEquipmentUseCase {
  constructor(private readonly equipmentRepository: IEquipmentRepository) {}

  async execute(data: CreateEquipmentDTO): Promise<EquipmentEntity> {
    const existing = await this.equipmentRepository.findBySerialNumber(
      data.serialNumber
    )
    if (existing) {
      throw new Error(
        `Equipment with serial number '${data.serialNumber}' already exists.`
      )
    }

    return this.equipmentRepository.create(data)
  }
}
