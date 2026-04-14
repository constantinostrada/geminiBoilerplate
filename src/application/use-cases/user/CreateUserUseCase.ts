import bcrypt from 'bcryptjs'
import { IUserRepository } from '../../../domain/repositories/IUserRepository'
import { CreateUserDTO, UserEntity } from '../../../domain/entities/User'

export class CreateUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateUserDTO): Promise<UserEntity> {
    const existing = await this.userRepository.findByEmail(data.email)
    if (existing) {
      throw new Error(`A user with email '${data.email}' already exists.`)
    }

    const hashedPassword = await bcrypt.hash(data.password, 10)

    return this.userRepository.create({
      ...data,
      password: hashedPassword,
    })
  }
}
