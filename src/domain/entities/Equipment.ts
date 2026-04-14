export type EquipmentStatus = 'available' | 'assigned' | 'maintenance' | 'retired'
export type EquipmentCategory =
  | 'laptop'
  | 'desktop'
  | 'monitor'
  | 'peripheral'
  | 'mobile'
  | 'other'

export interface EquipmentEntity {
  id: string
  serialNumber: string
  name: string
  category: EquipmentCategory
  brand: string
  model: string
  status: EquipmentStatus
  purchaseDate: Date | null
  purchaseCost: number | null
  warrantyExpiration: Date | null
  notes: string | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateEquipmentDTO {
  serialNumber: string
  name: string
  category: EquipmentCategory
  brand: string
  model: string
  purchaseDate?: Date
  purchaseCost?: number
  warrantyExpiration?: Date
  notes?: string
}

export interface UpdateEquipmentDTO {
  name?: string
  category?: EquipmentCategory
  brand?: string
  model?: string
  status?: EquipmentStatus
  purchaseDate?: Date
  purchaseCost?: number
  warrantyExpiration?: Date
  notes?: string
}
