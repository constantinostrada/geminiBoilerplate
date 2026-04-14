export type VacationRequestStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'cancelled'

export interface VacationRequestEntity {
  id: string
  employeeId: string
  reviewedBy: string | null
  startDate: Date
  endDate: Date
  totalDays: number
  status: VacationRequestStatus
  reason: string | null
  reviewNotes: string | null
  reviewedAt: Date | null
  createdAt: Date
  updatedAt: Date
}

export interface CreateVacationRequestDTO {
  employeeId: string
  startDate: Date
  endDate: Date
  totalDays: number
  reason?: string
}

export interface UpdateVacationRequestDTO {
  status?: VacationRequestStatus
  reviewedBy?: string
  reviewNotes?: string
  reviewedAt?: Date
}
