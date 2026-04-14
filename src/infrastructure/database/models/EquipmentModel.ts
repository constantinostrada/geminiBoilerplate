import { DataTypes, Model, Optional } from 'sequelize'
import { v4 as uuidv4 } from 'uuid'
import sequelize from '../connection'
import {
  EquipmentEntity,
  EquipmentStatus,
  EquipmentCategory,
} from '../../../domain/entities/Equipment'

type EquipmentCreationAttributes = Optional<
  EquipmentEntity,
  | 'id'
  | 'status'
  | 'purchaseDate'
  | 'purchaseCost'
  | 'warrantyExpiration'
  | 'notes'
  | 'createdAt'
  | 'updatedAt'
>

class EquipmentModel
  extends Model<EquipmentEntity, EquipmentCreationAttributes>
  implements EquipmentEntity
{
  declare id: string
  declare serialNumber: string
  declare name: string
  declare category: EquipmentCategory
  declare brand: string
  declare model: string
  declare status: EquipmentStatus
  declare purchaseDate: Date | null
  declare purchaseCost: number | null
  declare warrantyExpiration: Date | null
  declare notes: string | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

EquipmentModel.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: () => uuidv4(),
      primaryKey: true,
    },
    serialNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    category: {
      type: DataTypes.ENUM(
        'laptop',
        'desktop',
        'monitor',
        'peripheral',
        'mobile',
        'other'
      ),
      allowNull: false,
    },
    brand: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    model: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('available', 'assigned', 'maintenance', 'retired'),
      allowNull: false,
      defaultValue: 'available',
    },
    purchaseDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
    },
    purchaseCost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
      defaultValue: null,
    },
    warrantyExpiration: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      defaultValue: null,
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
    tableName: 'equipment',
    modelName: 'Equipment',
  }
)

export default EquipmentModel
