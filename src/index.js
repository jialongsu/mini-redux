import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import {createStore, applyMiddleware} from './libs/redux';
import {Provider} from './libs/react-redux';
import logger from './libs/redux-logger';
import thunk from './libs/redux-thunk';
import demoReduces from './reduces/demoReduces';

const store = createStore(demoReduces, applyMiddleware(logger, thunk));

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);