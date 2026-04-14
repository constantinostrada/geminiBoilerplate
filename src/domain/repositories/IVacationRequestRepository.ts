import {
  VacationRequestEntity,
  CreateVacationRequestDTO,
  UpdateVacationRequestDTO,
} from '../entities/VacationRequest'

export interface IVacationRequestRepository {
  findAll(): Promise<VacationRequestEntity[]>
  findById(id: string): Promise<VacationRequestEntity | null>
  findByEmployeeId(employeeId: string): Promise<VacationRequestEntity[]>
  create(data: CreateVacationRequestDTO): Promise<VacationRequestEntity>
  update(
    id: string,
    data: UpdateVacationRequestDTO
  ): Promise<VacationRequestEntity | null>
  delete(id: string): Promise<boolean>
}
