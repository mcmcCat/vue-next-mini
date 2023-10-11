import { extend } from "@vue/shared"
import { ComputedRefImpl } from "./computed"
import { Dep,createDep } from "./dep"

type KeyToDepMap = Map<any, Dep>
export type EffectScheduler = (...args:any[]) => any

const targetMap = new WeakMap<any,KeyToDepMap>
export interface ReactiveEffectOptions {
  lazy: boolean
  scheduler: EffectScheduler
}

export function effect<T = any>(fn: () => T, options?: ReactiveEffectOptions) {
  const _effect = new ReactiveEffect(fn)

  if(options) {
    extend(_effect,options)
  }

  if(!options || !options.lazy){
    _effect.run()
  }
}

export let activeEffect: ReactiveEffect | undefined

export class ReactiveEffect<T =any> {
    computed?: ComputedRefImpl<T>
    constructor(public fn: ()=> T, public scheduler: EffectScheduler | null = null) {}

    run() {
      activeEffect = this

      return this.fn()
    }

    stop() {}
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
  // for (const effect of effects) {
  //   triggerEffect(effect)
  // }

  // 不在依次触发，而是先触发所有计算属性依赖，在触发所有非计算属性依赖
  for (const effect of effects) {
    if(effect.computed){
      triggerEffect(effect)
    }
  }

  for (const effect of effects) {
    if(!effect.computed){
      triggerEffect(effect)
    }
  }
}
// 触发指定依赖
export function triggerEffect(effect: ReactiveEffect) {
  if(effect.scheduler){
    effect.scheduler()
  }else {
    effect.run()
  }
}