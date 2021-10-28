// import {useEffect, useState} from 'react';
import { useSelector, useDispatch } from './libs/react-redux';
// import ConnectDemo from './ConnectDemo';
import './App.css';

export default function Demo() {
  const num = useSelector((state) => state);
  const dispatch = useDispatch();

  // <ConnectDemo text='父组件传递的prop'/>

  const handleDecrement = (dispatch, getState) => {
    dispatch({type: 'decrement'});
  }

  return (
    <div>
      <div className='con'>
        <button onClick={() => dispatch(handleDecrement)}>-</button>
        <span>{num}</span>
        <button onClick={() => dispatch({type: 'increment'})}>+</button>
      </div>
    </div>
  );
}