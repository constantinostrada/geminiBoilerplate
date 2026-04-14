import { IEquipmentRepository } from '../../../domain/repositories/IEquipmentRepository'
import { EquipmentEntity } from '../../../domain/entities/Equipment'

export class GetAllEquipmentUseCase {
  constructor(private readonly equipmentRepository: IEquipmentRepository) {}

  async execute(): Promise<EquipmentEntity[]> {
    return this.equipmentRepository.findAll()
  }
}

export class GetEquipmentByIdUseCase {
  constructor(private readonly equipmentRepository: IEquipmentRepository) {}

  async execute(id: string): Promise<EquipmentEntity> {
    const equipment = await this.equipmentRepository.findById(id)
    if (!equipment) throw new Error(`Equipment with id '${id}' not found.`)
    return equipment
  }
}
