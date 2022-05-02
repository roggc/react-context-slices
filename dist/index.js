import { createContext, useContext } from "react";
import { useImmerReducer } from "use-immer";
export const _useStateContexts = [];
export const __useActions = [];
const _providers = [];

const useSuperStateContext = (slice, ...args) => {
  const useSuperCallback = (result, useStateContext) => ({ ...result,
    ...(useStateContext(slice) || {})
  });

  return args.reduce(useSuperCallback, {});
};

const useSuperActions = (...args) => {
  const useSuperCallback = (result, useActions) => ({ ...result,
    ...useActions()
  });

  return args.reduce(useSuperCallback, {});
};

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

  _useStateContexts.push(useStateContext);

  __useActions.push(_useActions(useDispatchContext));

  _providers.push(ContextProvider);

  return ContextProvider;
};
export const useValues = slice => {
  return useSuperStateContext(slice, ..._useStateContexts);
};
export const useActions = () => {
  return useSuperActions(...__useActions);
};
export const composeProviders = () => {
  const NeutralProvider = ({
    children
  }) => children;

  return _providers.reduce((AccProvider, Provider) => ({
    children
  }) => /*#__PURE__*/React.createElement(Provider, null, /*#__PURE__*/React.createElement(AccProvider, null, children)), NeutralProvider);
};