import { Dep,createDep } from "./dep"

type KeyToDepMap = Map<any, Dep>
const targetMap = new WeakMap<any,KeyToDepMap>

export function effect<T = any>(fn: () => T) {
  const _effect = new ReactiveEffect(fn)

  _effect.run()
}

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T =any> {
    constructor(public fn: ()=> T) {}

    run() {
      activeEffect = this

      return this.fn()
    }
}  

export function track(target:object,key:unknown) {
  if(!activeEffect) return 
  let depsMap = targetMap.get(target)
  if(!depsMap) {
    targetMap.set(target,(depsMap = new Map()))
  }

  let dep = depsMap.get(key)

  if(!dep) {
    depsMap.set(key,(dep = createDep()))
  }

  trackEffects(dep)
}

// 利用dep依次跟踪指定 key 的 所有effect
export function trackEffects(dep: Dep) {
  dep.add(activeEffect!)
}

export function trigger(target:object,key:unknown,newVal: unknown) {
  const depsMap = targetMap.get(target)
  if(!depsMap) return 
  const dep: Dep | undefined = depsMap.get(key)

  if(!dep) return 
  triggerEffects(dep)

}

// 依次触发 dep 中保存的依赖
export function triggerEffects(dep: Dep) {
  const effects = Array.isArray(dep) ? dep : [...dep]

  // 依次触发依赖
  for (const effect of effects) {
    triggerEffect(effect)
  }
}
// 触发指定依赖
export function triggerEffect(effect: ReactiveEffect) {
  effect.run()
}