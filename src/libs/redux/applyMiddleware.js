
// applyMiddleware的作用是使用一个或多个中间件对dispatch进行增强
// 1.applyMiddleware接收多个中间件
// 2.applyMiddleware需要返回store中所有的方法，包括增强后的dispatch
// 
export default function applyMiddleware(...middlewares) {
  return (createStore) => (reducer) => {
    // 创建store
    const store = createStore(reducer);

    /**
     * ...middleware (arguments): 遵循 Redux middleware API 的函数。
     * 每个 middleware 接受 Store 的 dispatch 和 getState 函数作为命名参数，并返回一个函数。
     * 该函数会被传入被称为 next 的下一个 middleware 的 dispatch 方法，并返回一个接收 action 的新函数，
     * 这个函数可以直接调用 next(action)，或者在其他需要的时刻调用，甚至根本不去调用它。
     * 调用链中最后一个 middleware 会接受真实的 store 的 dispatch 方法作为 next 参数，并借此结束调用链。
     * 所以，middleware 的函数签名是 ({ getState, dispatch }) => next => action。
     */

    //增强dispatch
    // 第一步，调用中间件传入dispatch和getState
    const middlewareApi = {
      getState: store.getState,
      dispatch: (action, ...args) => store.dispatch(action, ...args),
    };
    // 调用中间件函数，传入store的api
    // 在middlewareChain:中的中间件的结构为: (next) => (action) => ... 
    const middlewareChain = middlewares.map((middleware) => middleware(middlewareApi))

    /**
     * 例如现在有两个中间件：m1，m2
     * 他们在middlewareChain的是这样的：
     * function m1(next) => function m1A(action) ...
     * function m2(next) => function m2A(action) ...
     * 将m2作为参数传给m1，将dispatch作为参数传给m2：
     * m1( m2(dispatch) ) 变为 m1( m2A )
     * m1中的next = m2A (此时m2中的next = dispatch)
     * 当m1中调用next函数，则会执行m2A，m2A中调用next则会调用store中的dispatch方法
     * 
     * 使用compose方法（实际就是Array.reduce）返回的函数是这样：
     * (dispatch) => m1( m2(dispatch) )
     * 
     */
    // 使用组合函数，将中间件合并为一个增强后的dispatch函数
    const dispatch = compose(...middlewareChain)(store.dispatch);

    // 返回store的api，以及增强后的dispatch
    return {
      ...store,
      dispatch,
    };
  }
}

/**
 * 将多个函数合并为一个函数
 * 
 */
function compose(...funcs) {
  // 没有中间件的情况
  if(funcs.length === 0) {
    return (arg) => arg;
  }

  // 只有一个中间件的情况
  if(funcs.length === 1) {
    return funcs[0];
  }

  // 多个中间件的情况
  return funcs.reduce((a, b) => (...arg) => a(b(...arg)));
}


/** 
 * 
 * // 插件的格式

function pligin({dispatch, getState}) {

  return function nextFun(next) {

    return function actionFun(action) {
      next(action);
    }
  }
}

 * [p1-nextFun, p2-nextFun, p3-nextFun]
 * function p1-nextFun(next) {
 * 
 * 
 * }
 * 
 * p1-nextFun(p2-nextFun(p3-nextFun(dispatch)))
 * 
 * 
*/