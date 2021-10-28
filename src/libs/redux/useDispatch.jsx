import {useContext} from 'react';
import {ReduxContext} from '../react-redux/provider';

export default function useDispatch() {
  const store = useContext(ReduxContext);

  return store.dispatch;
}