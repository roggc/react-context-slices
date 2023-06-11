# react-context-slices

This package provides a simple and efficient way to manage state through Context in your React or React Native applications. By importing the `getHookAndProviderFromSlices` function and defining your desired slices of Context, you can quickly obtain a hook, `useSlice`, and a provider. The `useSlice` hook acts similar to `useState` or `useReducer` hooks, depending on whether you have defined a reducer for the slice.

## Table of Contents

[Installation](#installation)  
[How to use it (javascript)](#how-to-use-it-javascript)  
[How to use it (typescript)](#how-to-use-it-typescript)  
[Things you can do](#things-you-can-do)  
[A note on why "initialArg" nomenclature](#a-note-on-why-initialarg-nomenclature)  
[API Reference](#api-reference)

## Installation

`npm i react-context-slices`

## How to use it (javascript)

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: { initialArg: 0 },
  count2: {
    initialArg: 0,
    reducer: (state, { type }) => {
      switch (type) {
        case "increment":
          return state + 1;
        default:
          return state;
      }
    },
  },
  // rest of slices
});
```

```javascript
// app.jsx
import { useSlice } from "./slices";

const App = () => {
  const [count, setCount] = useSlice("count");
  const [count2, dispatchCount2] = useSlice("count2");
  return (
    <>
      <div>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        {count}
      </div>
      <div>
        <button onClick={() => dispatchCount2({ type: "increment" })}>+</button>
        {count2}
      </div>
    </>
  );
};

export default App;
```

```javascript
// index.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { Provider } from "./slices";

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <Provider>
      <App />
    </Provider>
  </React.StrictMode>
);
```

In case you want to get initial value of a slice from local storage, you do:

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  counter: { initialArg: 0, isGetInitialStateFromStorage: true },
  // rest of slices
});
```

and then in your component you do:

```javascript
// app.jsx
import { useSlice } from "./slices";
import { useEffect } from "react";

const App = () => {
  const [count, setCount] = useSlice("counter");

  // this persist the value to local storage
  useEffect(() => {
    localStorage.setItem("counter", JSON.stringify(count));
  }, [count]);

  return (
    <>
      <button onClick={() => setCount((c) => c + 1)}>+</button>
      {count}
    </>
  );
};

export default App;
```

For React Native you do the same but pass `AsyncStorage` as a second parameter to `getHookAndProviderFromSlices`:

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const { useSlice, Provider } = getHookAndProviderFromSlices(
  {
    counter: { initialArg: 0, isGetInitialStateFromStorage: true },
    // rest of slices
  },
  AsyncStorage // <-- pass this for React Native
);
```

and in your component you must do (for React Native):

```javascript
// app.jsx
import React, { useEffect, useRef } from "react";
import { useSlice } from "./slices";
import { Button, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const App = () => {
  const isInitialMountRef = useRef(true);
  const [count, setCount] = useSlice("counter");

  useEffect(() => {
    (async () => {
      !isInitialMount.current &&
        (await AsyncStorage.setItem("counter", JSON.stringify(count)));
    })();
  }, [count]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return (
    <View>
      <Button title="+" onPress={() => setCount((c) => c + 1)} />
      <Text>{count}</Text>
    </View>
  );
};

export default App;
```

You can also pass some middleware if you wish too. You must specify it in the definition of a slice:

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  todos: {
    initialArg: [],
    reducer: (state, action) => {
      switch (action.type) {
        case "FETCH_TODOS_REQUEST":
          return state;
        case "FETCH_TODOS_SUCCESS":
          return action.payload;
        case "FETCH_TODOS_FAILURE":
          return state;
        default:
          return state;
      }
    },
    middleware: [
      () => (next) => (action) => {
        // <-- logger middleware (first middleware applied)
        console.log("dispathing action:", action);
        next(action);
      },
      (dispatch) => (next) => (action) => {
        // <-- async middleware (second middleware applied)
        if (typeof action === "function") {
          return action(dispatch);
        }
        next(action);
      },
    ],
  },
  // rest of slices
});
```

Then you can write your action creator like:

```javascript
const fetchTodos = () => async (dispatch) => {
  dispatch({ type: "FETCH_TODOS_REQUEST" });
  try {
    const response = await fetch("https://api.example.com/todos");
    const todos = await response.json();
    dispatch({ type: "FETCH_TODOS_SUCCESS", payload: todos });
  } catch (error) {
    dispatch({ type: "FETCH_TODOS_FAILURE", payload: error.message });
  }
};
```

and then call it in your component with:

```javascript
// todos.jsx
import { useSlice } from "./slices";
import { useEffect } from "react";

const Todos = () => {
  const [todos, dispatchTodos] = useSlice("todos");
  useEffect(() => {
    dispatchTodos(fetchTodos());
  }, [dispatchTodos]);
  return {todos.map(/* ... */)};
};

export default Todos;
```

## How to use it (typescript)

```typescript
// slices.ts
import getHookAndProviderFromSlices, {
  defineSlice,
} from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: defineSlice<number, boolean>({
    initialArg: true, // 'initialArg' must be boolean in this case
    init: (condition: boolean) => (condition ? 0 : -1), // the 'init' function must return number and accept as a parameter a boolean.
    reducer: (state, { type }) => {
      // 'action' type can be any, 'state' must be number
      switch (type) {
        case "increment":
          return state + 1; // the return type must be number
        default:
          return state;
      }
    },
  }),
  // rest of slices
});
```

or you can do too:

```typescript
// slices.ts
import getHookAndProviderFromSlices, {
  defineSlice,
} from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: defineSlice<number>({
    initialArg: 5, // 'initialArg' must be number in this case
    init: (value: number) => value * value, // the 'init' function must return number and accept as a parameter a number.
  }),
  // rest of slices
});
```

Then in your component:

```typescript
// app.tsx
import { useSlice } from "./slices";

const App = () => {
  const [count, setCount] = useSlice<number>("count"); // here the type must be number, that is, the first generic passed in the definition of the slice.
  return (
    <>
      <div>
        <button onClick={() => setCount((c) => c + 1)}>+</button>
        {/* 'c' is of type number. */}
        {count}
      </div>
    </>
  );
};

export default App;
```

## Things you can do

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: {}, // <-- intialArg === undefined
  // rest of slices
});
```

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  isLightTheme: { initialArg: true, reducer: (state) => !state }, // <-- reducer without action
  // rest of slices
});
```

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  greeting: { initialArg: "hello", reducer: () => "bye" }, // <-- reducer without state and action
  // rest of slices
});
```

```javascript
// slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  greeting: { init: () => "hello" }, // <-- pass an 'init' function without an 'initialArg'
  // rest of slices
});
```

```javascript
// app.jsx
import { useSlice } from "./slices";

const App = () => {
  const [foo, setFoo] = useSlice(""); // 'foo' and 'setFoo' will be undefined. If you pass an empty string or a slice name that has not been defined (doesn't exist), it returns undefined for both 'value' and 'setValue'
  return null;
};

export default App;
```

## A note on why "initialArg" nomenclature

To define a slice you must pass an object which its possible keys (all optional) are `initialArg`, `init`, `reducer`, `isGetInitialStateFromStorage` and `middleware`. The first three of them are exactly the same as the defined in the React docs about `useReducer` hook. Check there the info to know what they do. The `isGetInitialStateFromStorage` its name is not `isGetInitialArgFromStorage` because in this case the `init` function will not be applied (in the case that a value from local storage has been recovered) even when supplied in the definition of the slice because what we save in the local storage it's the state value and not `initialArg`, so when we recover it we do not must apply the `init` function and use directly this value as initial state.

<style>
.name {
    min-width: 10%;
    max-width:10%;
}
.type {
    min-width: 30%;
    max-width:30%;
}
.description {
    min-width: 30%;
    max-width:30%;
}
.example {
    min-width: 30%;
    max-width:30%;
}
</style>

## API Reference

The library exports two functions: `getHookAndProviderFromSlices` and `defineSlice`. The first one is the main one and it's a default export. The second one it's only used in typescript.

<table class="api-reference"><tr><th class="name">Name</th>                                           <th class="type">Type</th>                                                                   <th class="description">Description</th>                                                                                                                                                                                                                                <th class="example">Example</th></tr><tr>
<td>

`getHookAndProviderFromSlices` (default import)

</td>  <td>

```typescript
(slices?: Slice<T, K>, AsyncStorage?: any) => ({
  useSlice: <T>(slice: string) => [T, SetValue<T> & Dispatch];
  Provider:({children}: React.PropsWithChildren) => JSX.Element;
})
```

</td> <td>

It is the main (and default) function exported by the library. You pass in an object containing the definition of the slices and you get a hook and a provider. For React Native you should pass the `AsyncStorage` as a second argument.

</td> <td>

```javascript
export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: { initialArg: 0 },
});
```

</td></tr><tr>                     
<td>

`defineSlice` (used in typescript)

</td>              <td>

```typescript
<T, K>(slice: Slice<T, K>) => Slice<T, K>;
```

</td>                              <td>

This function is the other function exported by the library. It's intended to use with typescript. It enforces rules for types in the definition of a slice object. It's a generic function.

</td>                                              <td>

```typescript
export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: defineSlice<number>({ initialArg: 0 }),
});
```

</td></tr></table>

Next are described other entities encountered when using this library:

<table><tr><th>Name</th>                       <th>Type</th>                                                                                                                                                                                                                              <th>Description</th>                                                                                                                                                                                                                                                                                                                                                     <th>Example</th>                                                                                                                                                                                                         </tr>
<tr><td>

slices object

</td>                   <td>

```typescript
{
  [name:string]: Slice<T, K>;
}
```

</td>                                                                                                                                                                                                 <td>

The slices object is an object which its keys are the name of the slices and its values are the slices themselves. Is the object passed as a first parameter to default exported function `getHookAndProviderFromSlices`. Each slice is an object with the following optional keys: `initialArg`, `init`, `reducer`, `isGetInitialStateFromStorage`, and `middleware`.

</td>  <td>

```javascript
{
  count: {initialArg: 0},
  todos: {initialArg: []}
}
```

</td></tr><tr>                                                                                                                                                             
<td>

a slice object

</td>                 <td>

```typescript
{
  initialArg?: K | T;
  init?: (initialArg: K) => T;
  reducer?: (state: T, action: any) => T;
  isGetInitialStateFromStorage?: boolean;
  middleware?: ((dispatch: Dispatch) => (next: Dispatch) => (action: any) => any)[];
}
```

</td>
 <td>
 
 A slice object is an object which its possible keys are (all optional): `initialArg`, `init`, `reducer`, `isGetInitialStateFromStorage`, and `middleware`.
 
 </td>                                                                                                                                                                                                             <td>
 
```javascript
{
  initialArg: false, 
  init: (condition) => condition ? 0 : -1
}
```
 
 </td></tr><tr>                                                                                                                                                  
<td>

`initialArg`

</td>                   <td>

```typescript
K | T;
```

</td>                                                                                                                                                                                                                           <td>

It's the argument passed to the `init` function to compute the initial state. If no `init` function is present in the definition of the slice, then it becomes the initial state.

</td>                                                                                                                                                                                       <td>

```javascript
{
  initialArg: 0;
}
```

</td>                                                                                                                                                                                               
</tr><tr><td>

`init`

</td>                         <td>

```typescript
(initialArg: K) => T;
```

</td>                                                                                                                                                                                                             <td>

It's the function used to compute initial state of the slice. It takes `initialArg` as an argument. If no present then `initialArg` it's the initial state.

</td>                                                                                                                                                                                                            <td>

```javascript
{
  init: () => 0;
}
```

</td></tr><tr>                                                                                                                                                                                               
<td>

`reducer`

</td>                      <td>

```typescript
(state: T, action: any) => T;
```

</td>                                                                                                                                                                                                     <td>

If a reducer is supplied in the definition of a slice, then the `useSlice`, when used with this slice, will return a dispatch function as a second value in the array. It is not defined, then the `useSlice` hook will return, for this slice, a setter function as a second value in the array.

</td>                                                                      <td>

```javascript
{
  reducer: (state) => !state;
}
```

</td></tr><tr>                                                                                                                                                                                    
<td>

`isGetInitialStateFromStorage`

</td>  <td>

```typescript
boolean;
```

</td>                                                                                                                                                                                                                          <td>

Indicates whether the initial state for the slice will be recovered from local storage (web) or Async Storage (React Native)

</td>                                                                                                                                                                                                                                           <td>

```javascript
{
  isGetInitialStateFromStorage: true;
}
```

</td></tr><tr>                                                                                                                                                                          
<td>

`middleware`

</td>                   <td>

```typescript
((dispatch: Dispatch) => (next: Dispatch) => (action: any) => any)[]
```

</td>                                                                                                                                                             <td>

It's an array where the middleware for the dispatch function is passed. The first middleware applied will be the first on the array, the second the next, etc, ending with the dispatch function itself.

</td>                                                                                                                                                               <td>

```javascript
{
  middleware: [
    () => (next) => (action) => {
      console.log("I am a middleware");
      next(action);
    },
    (dispatch) => (next) => (action) => {
      if (typeof action === "function") {
        return action(dispatch);
      }
      next(action);
    },
  ];
}
```

</td></tr><tr>
<td>

`useSlice`

</td>                     <td>

```typescript
<T>(slice: string) => [T, SetValue<T> & Dispatch];
```

</td>                                                                                                                                                                            <td>

It's the hook returned by the call to `getHookAndProviderFromSlices`. When used, you must pass the name of the slice you want to fetch or use. It will return an array where the first value is the state and the second a dispatch or setter function, depending on if a reducer was defined or not for the slice.

</td>                                                    <td>

```javascript
const [count, setCount] = useSlice("count");
```

</td></tr><tr>                                                                                                                                                                  
<td>

`Provider`

</td>                     <td>

```typescript
({ children }: React.PropsWithChildren) => JSX.Element;
```

</td>                                                                                                                                                                             <td>

It's the provider returned by the call to `getHookAndProviderFromSlices`. It must be used up in the tree, in order for the hook `useSlice` to work.

</td>                                                                                                                                                                                                                    <td>

```javascript
root.render(
  <Provider>
    <App />
  </Provider>
);
```

</td></tr></table>
