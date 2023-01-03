"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeProviders = exports.createSlice = void 0;
var React = __importStar(require("react"));
var use_immer_1 = require("use-immer");
var providers = [];
var createSlice = function (reducer, initialState, name, getUseActions, localStorageKeys) {
    if (localStorageKeys === void 0) { localStorageKeys = []; }
    var StateContext = React.createContext({});
    var DispatchContext = React.createContext(function () { });
    var useStateContext = function (slice) {
        return React.useContext(slice === name ? StateContext : {});
    };
    var useDispatchContext = function () { return React.useContext(DispatchContext); };
    var useValues = function (slice) {
        var state = useStateContext(slice);
        return state !== null && state !== void 0 ? state : {};
    };
    var useActions = getUseActions(useDispatchContext);
    var Provider = function (_a) {
        var children = _a.children;
        var initialState_ = undefined;
        if (!!localStorageKeys.length) {
            var item_1 = null;
            initialState_ = __assign(__assign({}, initialState), localStorageKeys.reduce(function (result, key) {
                var _a;
                return (__assign(__assign({}, result), ((item_1 = localStorage.getItem(key))
                    ? (_a = {}, _a[key] = JSON.parse(item_1), _a) : {})));
            }, {}));
        }
        var _b = (0, use_immer_1.useImmerReducer)(reducer, initialState_ !== null && initialState_ !== void 0 ? initialState_ : initialState), state = _b[0], dispatch = _b[1];
        return (React.createElement(StateContext.Provider, { value: state },
            React.createElement(DispatchContext.Provider, { value: dispatch }, children)));
    };
    providers.push(Provider);
    return {
        useValues: useValues,
        useActions: useActions,
        Provider: Provider,
    };
};
exports.createSlice = createSlice;
var composeProviders = function () {
    var NeutralProvider = function (_a) {
        var children = _a.children;
        return (React.createElement(React.Fragment, null, children));
    };
    return providers.reduce(function (AccProvider, Provider) {
        return function (_a) {
            var children = _a.children;
            return (React.createElement(Provider, null,
                React.createElement(AccProvider, null, children)));
        };
    }, NeutralProvider);
};
exports.composeProviders = composeProviders;
