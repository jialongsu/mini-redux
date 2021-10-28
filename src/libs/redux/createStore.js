export default function createStore(reduces, enhancer) {

  // 当传入中间件时，使用中间件增强dispatch
  if(enhancer) {
    return enhancer(createStore)(reduces);
  }

  let currentState = null; // store中储存的状态
  let currentListeners = []; // 事件中心

  // 发起state更新
  function dispatch(action) {
    // redux中action只能传入对象类型，不能传入函数等其它类型，如需要传入其它类型则需要使用中间件：redux-thunk，redux-saga等
    if (typeof action !== 'object' || action === null) {
      throw new Error(
        `Actions must be plain objects. Instead, the actual type was: '${action}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`
      )
    }

    // state改变的唯一方式，是通过reduce使用action和上一次的state计算出新的state
    currentState = reduces(currentState, action);
    // 当触发state后，通知view，state更新需重新渲染
    currentListeners.forEach((listen) => listen());
  }
  
  // 获取当前store中的state
  function getState() {
    return currentState;
  }
  
  // 注册state发生变化时的监听
  function subscribe(listen) {
    currentListeners.push(listen);

    // 返回一个解除监听的函数
    return function unsubscribe() {
      const index = currentListeners.indexOf(listen);
      currentListeners.splice(index, 1);
    }
  }

  // 获取初始值 在redux中会在combineReduces中进行reduce的调用获取初始值
  dispatch({type: 'REDUX/XXX'});

  return  {
    dispatch,
    getState,
    subscribe,
  };
}