import {
  EquipmentEntity,
  CreateEquipmentDTO,
  UpdateEquipmentDTO,
} from '../entities/Equipment'

export interface IEquipmentRepository {
  findAll(): Promise<EquipmentEntity[]>
  findById(id: string): Promise<EquipmentEntity | null>
  findBySerialNumber(serialNumber: string): Promise<EquipmentEntity | null>
  create(data: CreateEquipmentDTO): Promise<EquipmentEntity>
  update(id: string, data: UpdateEquipmentDTO): Promise<EquipmentEntity | null>
  delete(id: string): Promise<boolean>
}
