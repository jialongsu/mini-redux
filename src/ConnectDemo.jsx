import React from 'react';
import {bindActionCreators} from './libs/redux';
import {connect} from './libs/react-redux';

class ConnectDemo extends React.Component {

  render() {
    const {num, dispatch, add} = this.props;
    console.log('Connectdemo=======', this.props);
    return (
      <div className='con'>
        <button onClick={() => dispatch({type: 'decrement'})}>-</button>
        <span>{num}</span>
        <button onClick={add}>+</button>
      </div>
    );
  }
}

export default connect(
  (state, props) => {
    return {num: state};
  },
  // {add: () => ({type: 'increment'})}
  (dispatch, props) => {
    const actionCreators = {
      add: () => ({type: 'increment'}),
    };
    return bindActionCreators(actionCreators, dispatch);
  }
)(ConnectDemo);