import { IUserRepository } from '../../domain/repositories/IUserRepository'
import {
  UserEntity,
  CreateUserDTO,
  UpdateUserDTO,
} from '../../domain/entities/User'
import UserModel from '../database/models/UserModel'

export class UserRepository implements IUserRepository {
  async findAll(): Promise<UserEntity[]> {
    return UserModel.findAll({ raw: true })
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await UserModel.findByPk(id, { raw: true })
    return user ?? null
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await UserModel.findOne({ where: { email }, raw: true })
    return user ?? null
  }

  async create(data: CreateUserDTO): Promise<UserEntity> {
    const user = await UserModel.create(data as UserEntity)
    return user.toJSON() as UserEntity
  }

  async update(id: string, data: UpdateUserDTO): Promise<UserEntity | null> {
    const [affectedRows] = await UserModel.update(data, { where: { id } })
    if (affectedRows === 0) return null
    return this.findById(id)
  }

  async delete(id: string): Promise<boolean> {
    const deleted = await UserModel.destroy({ where: { id } })
    return deleted > 0
  }
}
