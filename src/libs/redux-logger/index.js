export default function logger({dispatch, getState}) {
  return next => action => {
    const preState = getState();
    console.log('=======logger=======================start');
    console.log('preState：', preState);
    console.log('action', action);
    const returnValue = next(action);
    const nextState = getState();
    console.log('nextState：', nextState);
    console.log('=======logger=======================end');
    return returnValue;
  }
}