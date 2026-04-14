import { IUserRepository } from '../../../domain/repositories/IUserRepository'
import { UserEntity } from '../../../domain/entities/User'

export class GetAllUsersUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(): Promise<UserEntity[]> {
    return this.userRepository.findAll()
  }
}

export class GetUserByIdUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(id)
    if (!user) throw new Error(`User with id '${id}' not found.`)
    return user
  }
}
