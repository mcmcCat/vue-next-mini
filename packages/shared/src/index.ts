export const isArray = Array.isArray

export const isObject = (val: unknown) => {
  return val !== null && typeof val === 'object'
}

export const hasChanged = (value: any, oldValue: any): boolean => !Object.is(value,oldValue)

export const isFunction = (val: unknown):val is Function => {
  return typeof val === 'function'
}
export const extend = Object.assign

export const EMPTY_OBJ: { readonly [key: string]: any } = {}