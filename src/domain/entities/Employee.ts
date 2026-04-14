export type EmploymentType = 'full_time' | 'part_time' | 'contractor'
export type EmployeeStatus = 'active' | 'inactive' | 'on_leave'

export interface EmployeeEntity {
  id: string
  userId: string
  employeeCode: string
  firstName: string
  lastName: string
  position: string
  department: string
  employmentType: EmploymentType
  status: EmployeeStatus
  hireDate: Date
  terminationDate: Date | null
  vacationDaysAllowed: number
  vacationDaysUsed: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateEmployeeDTO {
  userId: string
  employeeCode: string
  firstName: string
  lastName: string
  position: string
  department: string
  employmentType?: EmploymentType
  hireDate: Date
  vacationDaysAllowed?: number
}

export interface UpdateEmployeeDTO {
  firstName?: string
  lastName?: string
  position?: string
  department?: string
  employmentType?: EmploymentType
  status?: EmployeeStatus
  terminationDate?: Date | null
  vacationDaysAllowed?: number
  vacationDaysUsed?: number
}
