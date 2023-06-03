# react-context-slices

This package allows to manage state through Context in a React or React Native app in an easy, fast and optimal way. You have to import a function (`getHookAndProviderFromSlices`), define the slices of Context you want and this function will get you a hook and a provider. The hook, `useSlice`, acts either as a `useState` hook or a `useReducer` hook, depending on if you defined or not a reducer for the slice.

## Installation

`npm i react-context-slices`

## How to use it (javascript)

```javascript
//slices.js
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
//app.jsx
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
//index.jsx
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
//slices.js
import getHookAndProviderFromSlices from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  counter: { initialArg: 0, isGetInitialStateFromStorage: true },
  // rest of slices
});
```

and then in your component you do:

```javascript
//app.jsx
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
//slices.js
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

## How to use it (typescript)

```typescript
// slices.ts
import getHookAndProviderFromSlices, {
  defineSlice,
} from "react-context-slices";

export const { useSlice, Provider } = getHookAndProviderFromSlices({
  count: defineSlice<number, boolean>({
    initialArg: true, // initialArg must be boolean in this case
    init: (initialArg: boolean) => 0, // the init function must return number and accept as a parameter a boolean.
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
  count: {}, //<-- intialArg === undefined
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
  greeting: { init: () => "hello" }, // <-- pass an 'init' function instead of an 'initialArg'
  // rest of slices
});
```

## A note on why "initialArg" nomenclature

To define a slice you must pass an object which its possible keys (all optional) are `initialArg`, `init`, `reducer` and `isGetInitialStateFromStorage`. The first three of them are exactly the same as the defined in the React docs about `useReducer` hook. Check there the info to know what they do. The last one its name is `isGetInitialStateFromStorage` and not `isGetInitialArgFromStorage` because in this case the `init` function will not be applied (in the case that a value from local storage has been recovered) even when supplied (in the definition of the slice) because what we save in the local storage it's the state value and not `initialArg`, so when we recover it we do not must apply the `init` function and use directly this value as initial state.
