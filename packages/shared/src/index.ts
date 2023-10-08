export const isArray = Array.isArray

export const isObject = (val: unknown) => {
  return val !== null && typeof val === 'object'
}

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value,oldValue)