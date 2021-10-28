## 什么是redux
简单来说，redux是一个状态管理容器，它提供的模式和工具能够更容易的回溯状态的变化。

## 单向数据流

![bg2016011503.png](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/452bfd3be09f4ea5a2b56a010a64d791~tplv-k3u1fbpfcp-watermark.image?)

可以看到图中的单向数据流由这几个部分组成：
1. View：视图层，可以看做React中的组件
2. Action：动作，在View中执行了某个操作发出的消息
3. Dispatch：发送者，用于接收Action，通知Store根据Action改变数据
4. Store：用于保存应用状态，当状态发生变化，则会通知View进行更新

当用户访问View会经过如下步骤：
1. 用户访问一个View，View会从Store中获取状态来渲染页面
2. 当用户对View进行操作，如：点击，那么会对改操作生成对应的Action
3. 生成Action后，通过Dispatch将Action发送给Store，进行状态更新
4. Store更新完成后，会通知View使用最新的状态更新页面

在上面这个过程中，数据的流动总是单向的，在相邻的部分不会发生数据的”双向流动“。

在redux中对数据的处理也使用了**单向数据流**的概念。

## Redux的组成

Redux共有6部分组成：
1. store：保存应用的状态
2. state：应用的状态
3. action：拥有一个`type`属性的对象，表示改变`state`的意图
4. dispatch：接收一个`action`发送至`store`
5. reducer：Reducer是个纯函数,它接收上一次的`state`和`action`，通过上一次的`state`和`action`中的数据重新计算出新的`state`进行返回更新。
6. middleware：中间件，它的作用是通过高阶函数对`dispatch`进行组合，返回一个增强的`dispatch`函数

那么它们之间是如何工作的呢？

- 首次启动
  - 使用root reducer函数为参数创建store
  - store调用一次root reducer，并将它返回的值保存为初始的state
  - 当UI首次渲染的时候，UI组件会从store中拿出state，根据state来渲染界面。同时会对store进行监听，以便知道state是否有变化，有的话，则会根据新的state更新界面。
 
- 更新
  - 当用户与UI进行交互，如：点击事件
  - dispatch一个action到store，如：dispatch({type: "increment"})
  - store会用之前的state和当前的action再次运行reducer，将返回值保存为新的state
  - store会通知所有订阅过的UI，告诉它们state有新的变化
  - 当订阅过的UI收到通知，则从store中重新获取state更新界面
 
引用官方的流程动图：

![ReduxDataFlowDiagram-49fa8c3968371d9ef6f2a1486bd40a26.gif](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/c595201264fc41e28d09a1069521a9d5~tplv-k3u1fbpfcp-watermark.image?)

## 实现一个redux
通过上面，我们大致了解了redux的组成与原理，那么现在我们就来实现一个redux。

### 创建store
创建store前，我们先来分析一下它有哪些功能：
1. 储存状态
2. 需要被监听state的状态的变化，需要通知UI组件state的更新（订阅者模式）
3. 返回四个方法：
    - dispatch(action)：负责派发action到store
    - getState：获取当前store的state
    - subscribe(listener)：注册一个 state 发生变化时的回调函数
    - replaceReducer(nextReducer)可用于热重载和代码分割。通常你不需要用到这个 API（本次不实现该API）。

了解了store的功能，下面我们就来实现它。

```js
// 新建一个文件：createStore.js
export default function createStore(reducer) {

    let currentState = null; // store中储存的状态
    let currentListeners = []; // 事件中心
    
    function dispatch(action) {
        // state改变的唯一方式，是通过reduce使用action和上一次的state计算出新的state
        currentState = reducer(currentState, action);
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
    
    return {
        dispatch,
        getState,
        subscribe
    };
}
```
就这样，store就实现完成了，我们写个demo来验证一下：

```js
//创建一个reducer
function testReducer(state, action) {
    switch (action.type) {
    case 'increment':
      return state + 1;
    case 'decrement':
      return state - 1;
    default:
      return 0;
  }
}

// 创建store
const {dispatch, getState, subscribe} = createStore(testReducer);

// 监听state的变化
const unsubscribe = subscribe(() => {
    // 获取最新的state
    const state = getState();
    console.log('new state:', state); // 打印结果：1
});

// 发起更新state的动作
dispatch({type: 'increment'});

// 解除监听
unsubscribe();
```
运行demo后，结果完美。

### 添加中间件
我们知道，`redux`中`dispatch`只接收一个有一个`type`属性的对象作为`action`，如果我们想传入函数，或者请求接口等其它副作用的`action`的话，`redux`本身是不支持的。那么则需要通过中间件去增强`dispatch`的功能，从而达到支持的目的。

中间件的结构：

```js
function middleware({dispatch, getState}) {
    return (next) => {
        return (action) => {
            // 这个函数可以看做增强后的dispatch
            return next(action);
        }
    }
}
```
可以看到，中间件的其实也是一个函数，它接收`store`的`dispatch`和`getState`这两个API作为参数，并返回一个具有`next`参数的函数，这个内部函数里面又返回了将`action`作为参数的函数，并在这个函数中对`next`进行了调用。

next是什么？next函数指的就是下一个中间件，如果只有一个或者是最后一个中间件，那么它的next就是`dispatch`函数。

![1635403711557.jpg](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cb351aa8445b40429c1afc5feedc59da~tplv-k3u1fbpfcp-watermark.image?)

实现添加中间件前，我们先分析一下这个函数：
1. 需要给中间件传入`store`的API：`dispatch，getState`
2. 需要组合多个中间件增强`dispatch`

下面，我们来实现添加中间件：

```js
//创建一个applyMiddleware.js文件
export default function applyMiddleware(...middlewares) {
    return (createStore) => (reducer) => {
        
    };
}
```
我们知道在redux中`applyMiddleware`函数是通过参数的形式传入createStore方法的：

```js
createStore(reducer, applyMiddleware(middleware1, middleware2));
```
所以我们需要在之前的基础上修改一下`createStore`：

```js
// createStore.js
export default function createStore(reducer, enhancer) {

    // 当传入中间件时，使用中间件增强dispatch
    if(enhancer) {
        return enhancer(createStore)(reducer);
    }
    ...
    
    return {
        dispatch,
        getState,
        subscribe
    };
}
```
在`createStore`中我们判断是否添加中间件，有的话则将`createStore`和`reducer`传入`applyMiddleware`，通过中间件增强后，将store的api返回。

回过头继续写`applyMiddleware`：

```js
//创建一个applyMiddleware.js文件
export default function applyMiddleware(...middlewares) {
    return (createStore) => (reducer) => {
        // 创建store
        const store = createStore(reducer);
        
        //增强dispatch
        // 第一步，调用中间件传入dispatch和getState
        const middlewareApi = {
          getState: store.getState,
          dispatch: (action, ...args) => store.dispatch(action, ...args),
        };
        // 调用中间件函数，传入store的api
        // 在middlewareChain:中的中间件的结构为: (next) => (action) => ... 
        const middlewareChian = middlewares.map((middleware) => middleware(middlewareApi));
        
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
        
    };
}

/**
 * 将多个函数合并为一个函数
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
```
这个主要难点是在多个中间件组合增强`dispatch`方法，稍微有点绕，需要仔细想想。

ok，到这里中间件的添加也完成了。

### 创建redux-logger中间件
`redux-logger`的作用是打印出更新前的state，以及本次的action和更新后的state：

```js
// 创建一个redux-logger.js文件
export default function logger({dispatch, getState}) {
  return next => action => {
    const preState = getState(); // 获取更新前的state
    console.log('=======logger=======================start');
    console.log('preState：', preState);
    console.log('action', action);
    const returnValue = next(action); // dispatch action发起更新state
    const nextState = getState(); // 获取更新后的state
    console.log('nextState：', nextState);
    console.log('=======logger=======================end');
    return returnValue;
  }
}
```

那我们写个demo验证一下是否有效：

```js
// 创建store
const {dispatch, getState, subscribe} = createStore(testReducer, applyMiddleware(logger));

// 监听state的变化
// 控制台打印：
// =======logger=======================start
// preState： 0
// action {type: 'increment'}
// nextState： 1
// =======logger=======================end


const unsubscribe = subscribe(() => {
    // 获取最新的state
    const state = getState();
    console.log('new state:', state); // 打印结果：1
});

// 发起更新state的动作
dispatch({type: 'increment'});

// 解除监听
unsubscribe();
```
结果也是很完美。

到这里一个简易的完整的redux就实现完成了。


## 实现react-redux
`redux`是一个独立的状态管理容器，它可以用于任意的js框架上，如：Vue，react，Angular等。

在`react`中想要使用`redux`，则需要使用`react-redux`将`react`与`redux`进行连接。

我们只实现经常使用的`react-redux`的几个API：
1. Provider：store的提供者，可以进行跨层级传递store的api
2. connect：将 React 组件连接到 Redux store
3. useSelector：获取指定state的hook函数
4. useDispatch：获取dispatch方法的hook函数

### 实现Provider
`Provider`是一个组件，它通过将store赋值给value属性，进行跨层级传递store的api。

```js
// 创建Provider.js文件
import React from 'react';

export const ReduxContext = React.createContext();

export default function Provider({store, children}) {
    return (
        <ReduxContext.Provider value={store}>
          {children}
        </ReduxContext.Provider>
    );
}
```
我们通过`React`的`Context`这个Api实现store的跨层级传递。

### 实现connect
`connect`是个高阶函数，我们先来分析一下`connect`的功能：
1. 将React的组件与Redux的store进行连接，可以将state，dispatch等属性传递给React组件
2. 监听state的变化，有变化则会让组件强制更新，根据最新的state重新渲染。

ok，知道了`connect`的功能后，我们再分析一下它的调用形式:

```js
function connect(
    mapStateToProps, 
    mapDispatchToProps, 
    mergeProps, 
    options
)
```
可以看到，`connect`接收四个参数，我们只实现前面两个：
1. mapStateToProps：

```js
mapStateToProps?: (state, ownProps?) => Object
```
可以看到`mapStateToProps`是个函数，接收store的`state`，和父组件传递的`props(ownProps)`作为参数，返回一个对象，这个对象会被传递给react组件的`props`中。

2. mapDispatchToProps：

```js
mapDispatchToProps?: Object | (dispatch, ownProps?) => Object
```
可以看到`mapDispatchToProps`可以是一个对象，也可以是一个函数。
当是函数时，接收store的dispatch方法作为第一个参数，父组件传递的`props(ownProps)`作为第二个参数，返回的对象会被传递给react组件的`props`中：

```js
const mapDispatchToProps = (dispatch, ownProps) => {
    return {
        add: dispatch({type: 'add'});
    };
}
```

当传递对象时，这个对象会被传递给react组件的`props`中：

```js
mapDispatchToProps = {
    add: () => ({type: 'add'})
};
```

接下来，我们一起来实现它：

```js
// 新建connect.js文件
import {useContext, useEffect, useReducer} from 'react';
import {ReduxContext} from "./provider";

// 对action对象使用dispatch进行封装，传递给组件可直接调用，不用再单独调用dispatch方法
function bindActionCreators(actionCreators, dispatch) {
  const boundActionCreators = {dispatch};

  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    boundActionCreators[key] = (...args) => dispatch(actionCreator(...args));
  }

  return boundActionCreators;
}

// connect接收两个参数：mapStateToProps，mapDispatchToProps
const connect = (mapStateToProps, mapDispatchToProps) => {
    // connect是个高阶函数，需要返回一个接收组件为参数，返回一个新的组件的函数
    const wrapWithConnect = WrappedComponent => props => {
        // 获取store的api
        const {getState, subscribe, dispatch} = useContext(ReduxContext); 
        const [ignore, forceUpdate] = useReducer((preValue) => preValue + 1, 0);
        // 获取state
        const state = getState();
        // 调用mapStateToProps
        const stateProps = mapStateToProps && mapStateToProps(state, props);
        let dispatchProps = {dispatch};
        
        // 判断mapDispatchToProps的类型，是函数还是对象
        if(typeof(mapDispatchToProps) === 'function') {
          dispatchProps = mapDispatchToProps(dispatch, props);
        }else if (mapDispatchToProps && typeof(mapDispatchToProps) === 'object') {
          dispatchProps = bindActionCreators(mapDispatchToProps, dispatch);
        }
        
        // 监听state的变化，有变化调用forceUpdate进行强制刷新
        useEffect(function componentDidMount(){
          const unsubscribe = subscribe(() => {
            forceUpdate();
          });

          return function componentWillUnmount()  {
            unsubscribe && unsubscribe();
          }
        }, [subscribe]);
        
        
        return <WrappedComponent {...props} {...stateProps} {...dispatchProps}/>
    }
}
```
到这里`connect`也实现完成了。

### 实现useSelector
`useSelector`的功能：
1. 需要传入一个以state为参数的回调函数，返回一个指定的state。
2. 监听state的变化，有变化则需要组件强制更新

```js
const num = useSelector((state) => state.num);
```

下面我们来实现它：

```js
// 创建useSelector.js

import {useContext, useEffect, useReducer} from 'react';
import {ReduxContext} from './provider';

export default function useSelector(selector) {
  // 获取store的api
  const {getState, subscribe} = useContext(ReduxContext);
  // 强制更新
  const [ignore, forceUpdate] = useReducer((preValue) => preValue + 1, 0);

  // 监听state的变化
  useEffect(function componentDidMount() {
    const unsubscribe = subscribe(() => {
      forceUpdate();
    });
   
    return function componentWillUnmount() {
      unsubscribe && unsubscribe();
    }
  }, [subscribe]);

  // 传入state并调用回调函数，返回回调函数指定的state
  return selector(getState());
}
```
到这里`useSelector`也实现完成。

### 实现useDispatch
`useDispatch`的功能就是获取到`store`中的`dispatch`方法，然后暴露给外部进行调用：

```js
import {useContext} from 'react';
import {ReduxContext} from './provider';

export default function useDispatch() {
  const store = useContext(ReduxContext);

  return store.dispatch;
}
```

到这里一个简易的`react-redux`也实现完成了。

[点击这里查看完整的源码](https://github.com/jialongsu/mini-redux)