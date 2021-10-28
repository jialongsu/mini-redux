import {useContext, useEffect, useReducer} from 'react';
import {ReduxContext} from "./provider";
import bindActionCreators from '../redux/bindActionCreators';

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

  return wrapWithConnect;
};

export default connect;