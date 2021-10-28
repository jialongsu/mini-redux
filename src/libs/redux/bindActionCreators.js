export default function bindActionCreators(actionCreators, dispatch) {
  const boundActionCreators = {dispatch};

  for (const key in actionCreators) {
    const actionCreator = actionCreators[key];
    boundActionCreators[key] = (...args) => dispatch(actionCreator(...args));
  }

  return boundActionCreators;
}