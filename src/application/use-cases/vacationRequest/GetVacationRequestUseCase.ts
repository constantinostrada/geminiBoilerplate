import { IVacationRequestRepository } from '../../../domain/repositories/IVacationRequestRepository'
import { VacationRequestEntity } from '../../../domain/entities/VacationRequest'

export class GetAllVacationRequestsUseCase {
  constructor(
    private readonly vacationRequestRepository: IVacationRequestRepository
  ) {}

  async execute(): Promise<VacationRequestEntity[]> {
    return this.vacationRequestRepository.findAll()
  }
}

export class GetVacationRequestsByEmployeeUseCase {
  constructor(
    private readonly vacationRequestRepository: IVacationRequestRepository
  ) {}

  async execute(employeeId: string): Promise<VacationRequestEntity[]> {
    return this.vacationRequestRepository.findByEmployeeId(employeeId)
  }
}
