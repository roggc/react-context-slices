import * as React from "react";
import { configureStore, createSlice as createReduxSlice, } from "@reduxjs/toolkit";
import { Provider as ReduxProvider, useSelector, useDispatch, } from "react-redux";
const __SET_INIT_PERSISTED_STATE_RN__ = "__SET_INIT_PERSISTED_STATE_RN__";
const createSlice = (reducer, initialArg, init, name, getUseActions, isGetInitialStateFromStorage, AsyncStorage, middleware = [], initialState, reducers) => {
    const reduxSlice = !!reducers
        ? { [name]: createReduxSlice({ name, initialState, reducers }) }
        : {};
    const StateContext = React.createContext({});
    const DispatchContext = React.createContext(() => {
        console?.log("You must use the Provider up in the tree");
    });
    const useStateContext = (slice) => React.useContext(slice === name ? StateContext : {});
    const useDispatchContext = () => React.useContext(DispatchContext);
    const useValues = (slice) => {
        const state = useStateContext(slice);
        return state ?? {};
    };
    const useActions = getUseActions(useDispatchContext);
    let initialState_;
    if (isGetInitialStateFromStorage && !AsyncStorage) {
        let item;
        (item = localStorage.getItem(name)) !== null &&
            (initialState_ = JSON.parse(item));
    }
    const Provider = ({ children }) => {
        const reducerWrapper = (reducer) => (state, action) => !!action && action.type === __SET_INIT_PERSISTED_STATE_RN__
            ? reducer(action.payload, action)
            : reducer(state, action);
        const [state, dispatch] = React.useReducer(!!AsyncStorage & isGetInitialStateFromStorage
            ? reducerWrapper(reducer)
            : reducer, initialState_ !== undefined ? initialState_ : initialArg, initialState_ !== undefined ? undefined : init);
        const enhancedDispatch = React.useCallback(middleware
            .map((middleware) => middleware((action) => enhancedDispatch(action)))
            .reduceRight((dispatch, middleware) => middleware(dispatch), dispatch), [dispatch]);
        React.useEffect(() => {
            if (isGetInitialStateFromStorage && !!AsyncStorage) {
                (async () => {
                    let item;
                    let updateState;
                    (item = await AsyncStorage?.getItem?.(name)) !== null &&
                        (updateState = JSON.parse(item));
                    return updateState;
                })().then((updateState) => updateState !== undefined &&
                    dispatch({
                        type: __SET_INIT_PERSISTED_STATE_RN__,
                        payload: updateState,
                    }));
            }
        }, []);
        return (React.createElement(StateContext.Provider, { value: { [name]: state } },
            React.createElement(DispatchContext.Provider, { value: enhancedDispatch }, children)));
    };
    return {
        useValues,
        useActions,
        Provider,
        reduxSlice,
    };
};
const composeProviders = (providers) => {
    const NeutralProvider = ({ children }) => React.createElement(React.Fragment, null, children);
    return providers.reduce((AccProvider, Provider) => ({ children }) => (React.createElement(Provider, null,
        React.createElement(AccProvider, null, children))), NeutralProvider);
};
const createTypicalSlice = (name, initialArg, reducer, init, isGetInitialStateFromStorage, AsyncStorage, middleware, initialState, reducers) => {
    const SET = "SET";
    const reducer_ = reducer ??
        ((state, { type, payload }) => {
            switch (type) {
                case SET:
                    return typeof payload === "function" ? payload(state) : payload;
                default:
                    return state;
            }
        });
    const { useValues, useActions, Provider, reduxSlice } = createSlice(reducer_, initialArg, init, name, (useDispatch) => () => {
        const dispatch = useDispatch();
        const set = React.useCallback((value) => dispatch({ type: SET, payload: value }), [dispatch]);
        return !!reducer ? { [name]: { dispatch } } : { [name]: { set } };
    }, isGetInitialStateFromStorage, AsyncStorage, middleware, initialState, reducers);
    return { useValues, useActions, Provider, reduxSlice };
};
const getHookAndProviderFromSlices = (slices = {}, AsyncStorage = null) => {
    const { useValues, useActions, providers, reduxSlices } = Object.entries(slices)
        .map(([name, { initialArg, reducer, isGetInitialStateFromStorage, init, middleware, initialState, reducers, },]) => createTypicalSlice(name, initialArg, reducer, init, !!isGetInitialStateFromStorage, AsyncStorage, middleware, initialState, reducers))
        .reduce((res, values) => ({
        useValues: (slice) => ({
            ...res.useValues(slice),
            ...values.useValues(slice),
        }),
        useActions: () => ({ ...res.useActions(), ...values.useActions() }),
        providers: [...res.providers, values.Provider],
        reduxSlices: [...res.reduxSlices, values.reduxSlice],
    }), {
        useValues: (slice) => ({}),
        useActions: () => ({}),
        providers: [],
        reduxSlices: [],
    });
    const useSlice_ = (name) => {
        const { [name]: value } = useValues(name);
        const { [name]: actions } = useActions();
        return [value, !!slices[name]?.reducer ? actions.dispatch : actions?.set];
    };
    const useSlice = (name, selector = (state) => state) => {
        const reduxSlice = reduxSlices.find((rS) => !!rS[name]);
        if (!!reduxSlice) {
            const preSelector = (state) => state[name];
            const value = useSelector((state) => selector(preSelector(state)));
            return [value, useDispatch(), reduxSlice[name].actions];
        }
        return useSlice_(name);
    };
    const ReduxProviderWrapper = ({ children }) => {
        const reducer = reduxSlices.reduce((res, rS) => ({
            ...res,
            ...(!!Object.keys(rS).length
                ? { [Object.keys(rS)[0]]: Object.values(rS)[0].reducer }
                : rS),
        }), {});
        if (!Object.keys(reducer).length) {
            return React.createElement(React.Fragment, null, children);
        }
        const store = configureStore({
            reducer,
        });
        return React.createElement(ReduxProvider, { store: store }, children);
    };
    const Provider = composeProviders([...providers, ReduxProviderWrapper]);
    return {
        useSlice,
        Provider,
    };
};
export const defineSlice = (slice) => slice;
export default getHookAndProviderFromSlices;
