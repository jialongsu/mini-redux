import {useContext} from 'react';
import {ReduxContext} from './provider';

export default function useDispatch() {
  const store = useContext(ReduxContext);

  return store.dispatch;
}