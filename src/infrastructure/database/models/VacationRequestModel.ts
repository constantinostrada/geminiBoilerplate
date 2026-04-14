import { DataTypes, Model, Optional } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from '../connection'
import {
  VacationRequestEntity,
  VacationRequestStatus,
} from '../../../domain/entities/VacationRequest'

type VacationRequestCreationAttributes = Optional<
  VacationRequestEntity,
  | 'id'
  | 'reviewedBy'
  | 'status'
  | 'reason'
  | 'reviewNotes'
  | 'reviewedAt'
  | 'createdAt'
  | 'updatedAt'
>

class VacationRequestModel
  extends Model<VacationRequestEntity, VacationRequestCreationAttributes>
  implements VacationRequestEntity
{
  declare id: string
  declare employeeId: string
  declare reviewedBy: string | null
  declare startDate: Date
  declare endDate: Date
  declare totalDays: number
  declare status: VacationRequestStatus
  declare reason: string | null
  declare reviewNotes: string | null
  declare reviewedAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

VacationRequestModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },
    reviewedBy: {
      type: DataTypes.UUID,
      allowNull: true,
      defaultValue: null,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    totalDays: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    reason: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    reviewNotes: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    reviewedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: 'vacation_requests',
    modelName: 'VacationRequest',
  }
)

export default VacationRequestModel
