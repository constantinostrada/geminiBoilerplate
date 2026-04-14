import { IEquipmentAssignmentRepository } from '../../../domain/repositories/IEquipmentAssignmentRepository'
import { IEquipmentRepository } from '../../../domain/repositories/IEquipmentRepository'
import {
  CreateEquipmentAssignmentDTO,
  EquipmentAssignmentEntity,
} from '../../../domain/entities/EquipmentAssignment'

export class CreateEquipmentAssignmentUseCase {
  constructor(
    private readonly assignmentRepository: IEquipmentAssignmentRepository,
    private readonly equipmentRepository: IEquipmentRepository
  ) {}

  async execute(
    data: CreateEquipmentAssignmentDTO
  ): Promise<EquipmentAssignmentEntity> {
    const equipment = await this.equipmentRepository.findById(data.equipmentId)
    if (!equipment) {
      throw new Error(`Equipment with id '${data.equipmentId}' not found.`)
    }

    if (equipment.status !== 'available') {
      throw new Error(
        `Equipment '${equipment.name}' is not available for assignment (current status: ${equipment.status}).`
      )
    }

    const activeAssignment =
      await this.assignmentRepository.findActiveByEquipmentId(data.equipmentId)
    if (activeAssignment) {
      throw new Error(
        `Equipment '${equipment.name}' is already assigned to another employee.`
      )
    }

    return this.assignmentRepository.create(data)
  }
}
