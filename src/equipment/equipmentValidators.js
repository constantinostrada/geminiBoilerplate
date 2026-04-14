export const VALID_STATUSES = ['available', 'assigned', 'maintenance']
export const VALID_TYPES = ['laptop', 'desktop', 'monitor', 'keyboard', 'mouse', 'phone', 'tablet', 'other']

export function validateEquipmentInput({ type, brand, model, serialNumber, status }) {
  if (!type) {
    return 'type is required'
  }
  if (!brand) {
    return 'brand is required'
  }
  if (!model) {
    return 'model is required'
  }
  if (!serialNumber) {
    return 'serialNumber is required'
  }
  if (status !== undefined && !VALID_STATUSES.includes(status)) {
    return `status must be one of: ${VALID_STATUSES.join(', ')}`
  }
  return null
}

export function validateUpdateInput(fields) {
  const allowed = ['type', 'brand', 'model', 'serialNumber', 'status']
  for (const key of Object.keys(fields)) {
    if (!allowed.includes(key)) {
      return `field '${key}' is not allowed`
    }
  }
  if (fields.status !== undefined && !VALID_STATUSES.includes(fields.status)) {
    return `status must be one of: ${VALID_STATUSES.join(', ')}`
  }
  return null
}
