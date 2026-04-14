import { DataTypes, Model, Optional } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from '../connection'
import {
  EquipmentAssignmentEntity,
  AssignmentStatus,
} from '../../../domain/entities/EquipmentAssignment'

type EquipmentAssignmentCreationAttributes = Optional<
  EquipmentAssignmentEntity,
  | 'id'
  | 'assignedAt'
  | 'returnedAt'
  | 'status'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>

class EquipmentAssignmentModel
  extends Model<EquipmentAssignmentEntity, EquipmentAssignmentCreationAttributes>
  implements EquipmentAssignmentEntity
{
  declare id: string
  declare equipmentId: string
  declare employeeId: string
  declare assignedBy: string
  declare assignedAt: Date
  declare returnedAt: Date | null
  declare status: AssignmentStatus
  declare notes: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EquipmentAssignmentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    equipmentId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'equipment',
        key: 'id',
      },
    },
    employeeId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'employees',
        key: 'id',
      },
    },
    assignedBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    assignedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    returnedAt: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: null,
    },
    status: {
      type: DataTypes.ENUM('active', 'returned', 'lost'),
      allowNull: false,
      defaultValue: 'active',
    },
    notes: {
      type: DataTypes.TEXT,
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
    tableName: 'equipment_assignments',
    modelName: 'EquipmentAssignment',
  }
)

export default EquipmentAssignmentModel
