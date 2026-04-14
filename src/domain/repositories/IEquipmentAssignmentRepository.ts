import {
  EquipmentAssignmentEntity,
  CreateEquipmentAssignmentDTO,
  UpdateEquipmentAssignmentDTO,
} from '../entities/EquipmentAssignment'

export interface IEquipmentAssignmentRepository {
  findAll(): Promise<EquipmentAssignmentEntity[]>
  findById(id: string): Promise<EquipmentAssignmentEntity | null>
  findByEquipmentId(equipmentId: string): Promise<EquipmentAssignmentEntity[]>
  findByEmployeeId(employeeId: string): Promise<EquipmentAssignmentEntity[]>
  findActiveByEquipmentId(
    equipmentId: string
  ): Promise<EquipmentAssignmentEntity | null>
  create(
    data: CreateEquipmentAssignmentDTO
  ): Promise<EquipmentAssignmentEntity>
  update(
    id: string,
    data: UpdateEquipmentAssignmentDTO
  ): Promise<EquipmentAssignmentEntity | null>
  delete(id: string): Promise<boolean>
}
