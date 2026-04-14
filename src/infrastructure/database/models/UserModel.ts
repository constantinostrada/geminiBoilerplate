import { DataTypes, Model, Optional } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from '../connection'
import { UserEntity, UserRole } from '../../../domain/entities/User'

type UserCreationAttributes = Optional<
  UserEntity,
  'id' | 'role' | 'isActive' | 'createdAt' | 'updatedAt'
>

class UserModel
  extends Model<UserEntity, UserCreationAttributes>
  implements UserEntity
{
  declare id: string
  declare name: string
  declare email: string
  declare password: string
  declare role: UserRole
  declare isActive: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

UserModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'manager', 'employee'),
      allowNull: false,
      defaultValue: 'employee',
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    tableName: 'users',
    modelName: 'User',
  }
)

export default UserModel
