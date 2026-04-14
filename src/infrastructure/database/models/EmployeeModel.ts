import { DataTypes, Model, Optional } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from '../connection'
import {
  EmployeeEntity,
  EmploymentType,
  EmployeeStatus,
} from '../../../domain/entities/Employee'

type EmployeeCreationAttributes = Optional<
  EmployeeEntity,
  | 'id'
  | 'employmentType'
  | 'status'
  | 'terminationDate'
  | 'vacationDaysAllowed'
  | 'vacationDaysUsed'
  | 'createdAt'
  | 'updatedAt'
>

class EmployeeModel
  extends Model<EmployeeEntity, EmployeeCreationAttributes>
  implements EmployeeEntity
{
  declare id: string
  declare userId: string
  declare employeeCode: string
  declare firstName: string
  declare lastName: string
  declare position: string
  declare department: string
  declare employmentType: EmploymentType
  declare status: EmployeeStatus
  declare hireDate: Date
  declare terminationDate: Date | null
  declare vacationDaysAllowed: number
  declare vacationDaysUsed: number
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EmployeeModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    employeeCode: {
      type: DataTypes.STRING(20),
      allowNull: false,
      unique: true,
    },
    firstName: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    lastName: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    department: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    employmentType: {
      type: DataTypes.ENUM('full_time', 'part_time', 'contractor'),
      allowNull: false,
      defaultValue: 'full_time',
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'on_leave'),
      allowNull: false,
      defaultValue: 'active',
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    terminationDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    vacationDaysAllowed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 15,
    },
    vacationDaysUsed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    tableName: 'employees',
    modelName: 'Employee',
  }
)

export default EmployeeModel
