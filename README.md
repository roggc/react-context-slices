# react-context-slices

This package is meant to use **_React Context_** in an optimal and easy way. It creates slices of context that can be consumed through a unique interface. It uses Immer under the hood (dependency).

## Installation

To install this package you must do **_npm i react-context-slices_** in the terminal in the root directory of your React project.

## How to use it (fast - the new way)

```javascript
//slices.ts

import { getHooksAndProviderFromSlices } from "react-context-slices";

export const { useSlice, Provider } = getHooksAndProviderFromSlices({
  counter: 0,
  //other possible slices, for example:
  //todos:[],
});
```

```javascript
//app.tsx

import { useSlice } from "./slices";

const App = () => {
  const [counter, setCounter] = useSlice("counter");
  return (
    <>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
      {counter}
    </>
  );
};

export default App;
```

```javascript
//index.tsx

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
//slices.ts

import { getHooksAndProviderFromSlices } from "react-context-slices";

export const { useSlice, Provider } = getHooksAndProviderFromSlices(
  {
    counter: 0,
  },
  { counter: true } // <-- this will get initial value of slice from local storage
);
```

and then in your component you do:

```javascript
//app.tsx

import { useSlice } from "./hooks/use-slice";
import { useEffect } from "react";

const App = () => {
  const [counter, setCounter] = useSlice("counter");

  // this persist the value to local storage
  useEffect(() => {
    localStorage.setItem("counter", JSON.stringify(counter));
  }, [counter]);

  return (
    <>
      <button onClick={() => setCounter(counter + 1)}>increment</button>
      {counter}
    </>
  );
};

export default App;
```

For React Native you do the same but pass `AsyncStorage` as a parameter to `getHooksAndProviderFromSlices`:

```javascript
//slices.ts
import { getHooksAndProviderFromSlices } from "react-context-slices";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const { useSlice, Provider } = getHooksAndProviderFromSlices(
  {
    counter: 0,
  },
  { counter: true }, // <-- this will get initial value of slice from local storage
  AsyncStorage
);
```

and in your component you do (for React Native):

```javascript
import React, { useEffect, useRef } from "react";
import { useSlice } from "./slices";
import { Button, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Counter = () => {
  const isInitialMount = useRef(true);
  const [counter, setCounter] = useSlice("counter");

  useEffect(() => {
    (async () => {
      if (
        counter !== null &&
        counter !== undefined &&
        !isInitialMount.current
      ) {
        await AsyncStorage.setItem("counter", JSON.stringify(counter));
      }
    })();
  }, [counter]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return (
    <View style={styles.container}>
      <Button title="increment" onPress={() => setCounter(counter + 1)} />
      <View>
        <Text>{`counter value is ${counter}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
});

export default Counter;
```

## How to use it (verbose and boilerplate - the old way (not recomended))

Here is an example app of how to use it. First we create a slice named counter. Create a **_slices_** folder in your project and add a **_counter.ts_** file (javascript is the same but without the types stuff):

```javascript
//slices/counter.ts
import { createSlice, A, D } from "react-context-slices";

type S = {
  value: number,
};

export const name = "counter";
const initialState: S = { value: 0 };
const INCREMENT = "INCREMENT";
const reducer = (draft: D<S>, { type }: A) => {
  switch (type) {
    case INCREMENT:
      draft.value += 1;
      break;
    default:
      break;
  }
};

export const { useValues, useActions, Provider } =
  createSlice <
  S >
  (reducer,
  initialState,
  name,
  (useDispatch) => () => {
    const dispatch = useDispatch();
    const increment = () => dispatch({ type: INCREMENT });
    return { [name]: { increment } };
  });
```

Next it's to create a single interface to all the slices (suppose we have more than one). For this create an **_index.ts_** file in the **_slices_** folder and put this:

```javascript
//slices/index.ts
import { composeProviders } from "react-context-slices";
import {
  useValues as useCounterValues,
  useActions as useCounterActions,
  Provider as CounterProvider,
} from "./counter";
//import {useValues as useOtherSliceValues, useActions as useOtherSliceActions, Provider as OtherSliceProvider} from "./otherSlice";

export { name as counter } from "./counter";
//export {name as otherSlice} from "./otherSlice";

export const useActions = () => ({
  ...useCounterActions(),
  //...useOtherSliceActions(),
});

export const useValues = (slice: string) => ({
  ...useCounterValues(slice),
  //...useOtherSliceValues(slice),
});

export default composeProviders([CounterProvider /*, OtherSliceProvider*/]);
```

Now we can consume all the slices of context created through a unique interface, that's it, using **_useValues_** and **_useActions_**. This is how will be done in the **_Counter_** commponent:

```javascript
import { useValues, useActions, counter } from "./slices";

const Counter = () => {
  const { value } = useValues(counter);
  const {
    [counter]: { increment },
  } = useActions();

  return (
    <>
      <button onClick={increment}>increment</button>
      <div>{value}</div>
    </>
  );
};

export default Counter;
```

Finally, this would be the code for the **_App_** component:

```javascript
import AppProvider from "./slices";
import Counter from "./Counter";

const App = () => {
  return (
    <AppProvider>
      <Counter />
    </AppProvider>
  );
};

export default App;
```

In case you want to persist some values to local storage (web) or React Native Async Storage you do the following.

For web you do:

```javascript
export const { useValues, useActions } =
  createSlice <
  S >
  (reducer,
  initialState,
  name,
  (useDispatch) => () => {
    const dispatch = useDispatch();
    const increment = () => dispatch({ type: INCREMENT });
    return { [name]: { increment } };
  },
  ["value"]); //<-- add this
```

And then in the component you can do:

```javascript
import { useValues, useActions, counter } from "./slices";
import { useEffect } from "react";

const Counter = () => {
  const { value } = useValues(counter);
  const {
    [counter]: { increment },
  } = useActions();

  useEffect(() => {
    localStorage.setItem("value", JSON.stringify(value));
  }, [value]);

  return (
    <>
      <button onClick={increment}>increment</button>
      <div>{value}</div>
    </>
  );
};

export default Counter;
```

For **_React Native_** you would do:

```javascript
import {createSlice, D, A} from 'react-context-slices';
import AsyncStorage from '@react-native-async-storage/async-storage';

type S = {
  counterValue: number;
};

export const name = 'counter';
const initialState: S = {counterValue: 0};
const INCREMENT = 'INCREMENT';
const reducer = (draft: D<S>, {type}: A) => {
  switch (type) {
    case INCREMENT:
      draft.counterValue += 1;
      break;
    default:
      break;
  }
};
export const {useValues, useActions, Provider} = createSlice<S>(
  reducer,
  initialState,
  name,
  useDispatch => () => {
    const dispatch = useDispatch();
    const increment = () => {
      dispatch({type: INCREMENT});
    };
    return {[name]: {increment}};
  },
  ['counterValue'],
  AsyncStorage,
);
```

And in the **_Counter_** you could do something like:

```javascript
import React, { useEffect, useRef } from "react";
import { useValues, useActions, counter } from "../slices";
import { Button, Text, View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Counter = () => {
  const isInitialMount = useRef(true);
  const { counterValue } = useValues(counter);
  const {
    [counter]: { increment },
  } = useActions();

  useEffect(() => {
    (async () => {
      if (
        counterValue !== null &&
        counterValue !== undefined &&
        !isInitialMount.current
      ) {
        await AsyncStorage.setItem(
          "counterValue",
          JSON.stringify(counterValue)
        );
      }
    })();
  }, [counterValue]);

  useEffect(() => {
    isInitialMount.current = false;
  }, []);

  return (
    <View style={styles.container}>
      <Button title="increment" onPress={increment} />
      <View>
        <Text>{`counter value is ${counterValue}`}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
});

export default Counter;
```
