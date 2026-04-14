import { IVacationRequestRepository } from '../../../domain/repositories/IVacationRequestRepository'
import {
  CreateVacationRequestDTO,
  VacationRequestEntity,
} from '../../../domain/entities/VacationRequest'

export class CreateVacationRequestUseCase {
  constructor(
    private readonly vacationRequestRepository: IVacationRequestRepository
  ) {}

  async execute(
    data: CreateVacationRequestDTO
  ): Promise<VacationRequestEntity> {
    if (data.startDate >= data.endDate) {
      throw new Error('Start date must be before end date.')
    }

    return this.vacationRequestRepository.create(data)
  }
}
