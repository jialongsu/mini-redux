// 使用Provide组件将redux的store注入到react中
import React from 'react';

export const ReduxContext = React.createContext();

export default function Provide({store, children}) {
  return (
    <ReduxContext.Provider value={store}>
      {children}
    </ReduxContext.Provider>
  );
}