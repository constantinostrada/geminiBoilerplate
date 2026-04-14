export type AssignmentStatus = 'active' | 'returned' | 'lost'

export interface EquipmentAssignmentEntity {
  id: string
  equipmentId: string
  employeeId: string
  assignedBy: string
  assignedAt: Date
  returnedAt: Date | null
  status: AssignmentStatus
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateEquipmentAssignmentDTO {
  equipmentId: string
  employeeId: string
  assignedBy: string
  assignedAt?: Date
  notes?: string
}

export interface UpdateEquipmentAssignmentDTO {
  returnedAt?: Date
  status?: AssignmentStatus
  notes?: string
}
