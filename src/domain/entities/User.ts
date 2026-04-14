export type UserRole = 'admin' | 'manager' | 'employee'

export interface UserEntity {
  id: string
  name: string
  email: string
  password: string
  role: UserRole
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateUserDTO {
  name: string
  email: string
  password: string
  role?: UserRole
}

export interface UpdateUserDTO {
  name?: string
  email?: string
  password?: string
  role?: UserRole
  isActive?: boolean
}
