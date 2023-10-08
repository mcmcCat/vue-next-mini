import { isObject } from '@vue/shared'
import {mutableHandlers} from './baseHandlers'

// 为什么要用 WeakMap 呢？我们去看下面的 proxyMap
export const reactiveMap = new WeakMap<object,any>()

export function reactive(target: object) {
  return createReactiveObject(target,mutableHandlers,reactiveMap)
}

function createReactiveObject(target: object,baseHandlers: ProxyHandler<any>,proxyMap:WeakMap<Object,any>) {
  const existingProxy = proxyMap.get(target)
  if(existingProxy){
    return existingProxy
  }

  const proxy = new Proxy(target,baseHandlers)

  // proxyMap缓存代理对象，WeakMap 规定key是对象并且是弱引用的，所以当被代理对象不存在其他引用时，会被垃圾回收，从而起到优化内存空间的作用
  proxyMap.set(target,proxy)
  
  return proxy
}

export const toReactive = <T extends unknown>(value :T): T => {
  return isObject(value) ? reactive(value as object) : value
}