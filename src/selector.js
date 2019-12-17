function defaultEqualityCheck(a, b) {
  return a === b
}

function areArgumentsShallowlyEqual(equalityCheck, prev, next) {
  if (prev === null || next === null || prev.length !== next.length) {
    return false
  }

  // Do this in a for loop (and not a `forEach` or an `every`) so we can determine equality as fast as possible.
  const length = prev.length
  for (let i = 0; i < length; i++) {
    if (!equalityCheck(prev[i], next[i])) {
      return false
    }
  }

  return true
}

export function defaultMemoize(func, equalityCheck = defaultEqualityCheck) {
  // 通过闭包定义了两个私有变量：lastArgs和lastResult
  // 分别代表上一次执行计算所用的参数集合和计算的结果。
  // 并在返回的结果计算函数中对最新的参数和上一次的参数进行equalityCheck，如果相同则使用缓存；如果不同则重新计算结果。
  let lastArgs = null
  let lastResult = null
  // we reference arguments instead of spreading them for performance reasons
  // 返回一个带缓存的结果计算函数。
  const innerFunc = (...args) => {
    // 闭包变量不会销毁
    if (!areArgumentsShallowlyEqual(equalityCheck, lastArgs, args)) {
      // apply arguments instead of spreading for performance.
      lastResult = func.apply(null, args)
    }
    lastArgs = args
    return lastResult
  }
  return innerFunc
}

function getDependencies(funcs) {
  const dependencies = Array.isArray(funcs[0]) ? funcs[0] : funcs

  if (!dependencies.every(dep => typeof dep === 'function')) {
    const dependencyTypes = dependencies.map(
      dep => typeof dep
    ).join(', ')
    throw new Error(
      'Selector creators expect all input-selectors to be functions, ' +
      `instead received the following types: [${dependencyTypes}]`
    )
  }

  return dependencies
}

export function createSelectorCreator(memoize, ...memoizeOptions) {
  
  return (...funcs) => {
    let recomputations = 0
    //获取转换函数
    const resultFunc = funcs.pop()
    // 依赖的selector
    const dependencies = getDependencies(funcs)
    //对结果计算函数使用用户传入的缓存策略（默认为上面说的defaultMemoize）。并且每执行一次结果计算函数，计数就加1
    const memoizedResultFunc = memoize(
      function (...args) {
        recomputations++
        // apply arguments instead of spreading for performance.
        return resultFunc.apply(null, args)
      },
      ...memoizeOptions
    )

    // If a selector is called with the exact same arguments we don't need to traverse our dependencies again.
    //selector就是createSelector的返回值函数。
    //selector函数要做的事情就是把依赖的每一个中间结果计算函数依次执行，并组装成一个结果数组。
    //交给结果计算函数处理。在selector函数的参数值引用未发生变化时，中间计算函数不需要重复进行计算。
    const selector = memoize(function (...args) {
      const params = []
      const length = dependencies.length

      for (let i = 0; i < length; i++) {
        // apply arguments instead of spreading and mutate a local list of params for performance.
        // 循环执行所有依赖的计算函数，并把执行的结果保存在数组缓存中
        params.push(dependencies[i].apply(null, args))
      }
      //执行结果计算函数，返回最终计算结果
      // apply arguments instead of spreading for performance.
      return memoizedResultFunc.apply(null, params)
    })

    selector.resultFunc = resultFunc
    selector.dependencies = dependencies
    selector.recomputations = () => recomputations
    selector.resetRecomputations = () => recomputations = 0
    return selector
  }
}

export const createSelector = createSelectorCreator(defaultMemoize)

export function createStructuredSelector(selectors, selectorCreator = createSelector) {
  if (typeof selectors !== 'object') {
    throw new Error(
      'createStructuredSelector expects first argument to be an object ' +
      `where each property is a selector, instead received a ${typeof selectors}`
    )
  }
  const objectKeys = Object.keys(selectors)
  return selectorCreator(
    objectKeys.map(key => selectors[key]),
    (...values) => {
      return values.reduce((composition, value, index) => {
        composition[objectKeys[index]] = value
        return composition
      }, {})
    }
  )
}


