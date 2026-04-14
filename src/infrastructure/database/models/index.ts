import UserModel from './UserModel'
import EmployeeModel from './EmployeeModel'
import VacationRequestModel from './VacationRequestModel'
import EquipmentModel from './EquipmentModel'
import EquipmentAssignmentModel from './EquipmentAssignmentModel'

// User — Employee  (1:1)
UserModel.hasOne(EmployeeModel, {
  foreignKey: 'userId',
  as: 'employee',
  onDelete: 'RESTRICT',
})
EmployeeModel.belongsTo(UserModel, {
  foreignKey: 'userId',
  as: 'user',
})

// Employee — VacationRequest  (1:N)
EmployeeModel.hasMany(VacationRequestModel, {
  foreignKey: 'employeeId',
  as: 'vacationRequests',
  onDelete: 'CASCADE',
})
VacationRequestModel.belongsTo(EmployeeModel, {
  foreignKey: 'employeeId',
  as: 'employee',
})

// User — VacationRequest  (reviewer, 1:N)
UserModel.hasMany(VacationRequestModel, {
  foreignKey: 'reviewedBy',
  as: 'reviewedVacationRequests',
  onDelete: 'SET NULL',
})
VacationRequestModel.belongsTo(UserModel, {
  foreignKey: 'reviewedBy',
  as: 'reviewer',
})

// Equipment — EquipmentAssignment  (1:N)
EquipmentModel.hasMany(EquipmentAssignmentModel, {
  foreignKey: 'equipmentId',
  as: 'assignments',
  onDelete: 'RESTRICT',
})
EquipmentAssignmentModel.belongsTo(EquipmentModel, {
  foreignKey: 'equipmentId',
  as: 'equipment',
})

// Employee — EquipmentAssignment  (1:N)
EmployeeModel.hasMany(EquipmentAssignmentModel, {
  foreignKey: 'employeeId',
  as: 'equipmentAssignments',
  onDelete: 'RESTRICT',
})
EquipmentAssignmentModel.belongsTo(EmployeeModel, {
  foreignKey: 'employeeId',
  as: 'employee',
})

// User — EquipmentAssignment  (assigner, 1:N)
UserModel.hasMany(EquipmentAssignmentModel, {
  foreignKey: 'assignedBy',
  as: 'madeAssignments',
  onDelete: 'RESTRICT',
})
EquipmentAssignmentModel.belongsTo(UserModel, {
  foreignKey: 'assignedBy',
  as: 'assigner',
})

export {
  UserModel,
  EmployeeModel,
  VacationRequestModel,
  EquipmentModel,
  EquipmentAssignmentModel,
}
