import React, { createContext, useContext } from "react";
import { useImmerReducer } from "use-immer";
const providers = [];
export const createSlice = (reducer, initialState, name, _useActions) => {
  const stateContext = /*#__PURE__*/createContext();
  const dispatchContext = /*#__PURE__*/createContext();

  const useStateContext = slice => useContext(slice === name ? stateContext : {});

  const useDispatchContext = () => useContext(dispatchContext);

  const ContextProvider = ({
    children
  }) => {
    const [state, dispatch] = useImmerReducer(reducer, initialState);
    return /*#__PURE__*/React.createElement(stateContext.Provider, {
      value: state
    }, /*#__PURE__*/React.createElement(dispatchContext.Provider, {
      value: dispatch
    }, children));
  };

  const useValues = slice => {
    const state = useStateContext(slice);
    return state || {};
  };

  providers.push(ContextProvider);
  return {
    useValues,
    useActions: _useActions(useDispatchContext),
    Provider: ContextProvider
  };
};
export const composeProviders = () => {
  const NeutralProvider = ({
    children
  }) => children;

  return providers.reduce((AccProvider, Provider) => ({
    children
  }) => /*#__PURE__*/React.createElement(Provider, null, /*#__PURE__*/React.createElement(AccProvider, null, children)), NeutralProvider);
};