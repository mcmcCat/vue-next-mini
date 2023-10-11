import { EMPTY_OBJ, hasChanged, isObject } from "@vue/shared"
import { isReactive } from "packages/reactivity/src/reactive"
import { queuePreFlushCb } from "."
import { ReactiveEffect } from "packages/reactivity/src/effect"



export interface WatchOptions<Immediate = boolean> {
	immediate?: Immediate
	deep?: boolean
}

export function watch(source: any, cb: Function, options?: WatchOptions) {
	return doWatch(source as any, cb, options)
}

function doWatch(
	source: any,
	cb: Function,
	{ immediate, deep }: WatchOptions = EMPTY_OBJ
) {
	// 触发 getter 的指定函数
	let getter: () => any

	// 判断 source 的数据类型
	if (isReactive(source)) {
		// 指定 getter
		getter = () => source
		// 深度
		deep = true
	} else {
		getter = () => {}
	}

	// 存在回调函数和deep
	if (cb && deep) {
		// TODO
		const baseGetter = getter
		getter = () => traverse(baseGetter())
	}

	// 旧值
	let oldValue = {}
	// job 执行方法
	const job = () => {
		if (cb) {
			// watch(source, cb)
			const newValue = effect.run()
			if (deep || hasChanged(newValue, oldValue)) {
				cb(newValue, oldValue)
				oldValue = newValue
			}
		}
	}

	// 调度器
	let scheduler = () => queuePreFlushCb(job)

	const effect = new ReactiveEffect(getter, scheduler)

	if (cb) {
		if (immediate) {
			job()
		} else {
			oldValue = effect.run()
		}
	} else {
		effect.run()
	}

	return () => {
		effect.stop()
	}
}

/**
 * 依次执行 getter，从而触发依赖收集
 */
export function traverse(value: unknown, seen?: Set<unknown>) {
	if (!isObject(value)) {
		return value
	}
	// seen = seen || new Set()

	// seen.add(value)

	for (const key in value as object) {
		traverse((value as any)[key], seen)
	}
	return value
}
