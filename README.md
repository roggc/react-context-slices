# react-context-slices

This package is meant to use **_React Context_** in an optimal and easy way. It creates slices of context that can be consumed through a unique interface. It uses Immer under the hood (dependency).

## Installation

To install this package you must do **_npm i react-context-slices_** in the terminal in the root directory of your React project.

## How to use it

Here is an example app of how to use it. First we create a slice named counter. Create a **_slices_** folder in your project and add a **_counter.ts_** file (javascript is the same but without the types stuff):

```javascript
//slices/counter.ts
import { createSlice, A, D } from "react-context-slices";

type S = {
  value: number;
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

export const { useValues, useActions } = createSlice<S, A>(
  reducer,
  initialState,
  name,
  (useDispatch) => () => {
    const dispatch = useDispatch();
    const increment = () => dispatch({ type: INCREMENT });
    return { [name]: { increment } };
  },
  ["value"]
);
```

Next it's to create a single interface to all the slices (suppose we have more than one). For this create an **_index.ts_** file in the **_slices_** folder and put this:

```javascript
//slices/index.ts
import { composeProviders } from "react-context-slices";
import {
  useValues as useCounterValues,
  useActions as useCounterActions,
} from "./counter";
//import {useValues as useOtherSliceValues, useActions as useOtherSliceActions} from "./otherSlice";

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

export default composeProviders();
```

Now we can consume all the slices of context created through a unique interface, that's it, using **_useValues_** and **_useActions_**. This is how will be done in the **_Counter_** commponent:

```javascript
import { useValues, useActions, counter } from "./slices";
import { useLocalStorage } from "./hooks";
import { useEffect } from "react";

const Counter = () => {
  const { value } = useValues(counter);
  const {
    [counter]: { increment },
  } = useActions();
  const [, setValueLS] = useLocalStorage("value", value);

  useEffect(() => {
    setValueLS(value);
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

The local storage part is optional. When we created the slice of context in the **_counter.ts_** file we did:

```javascript
export const { useValues, useActions } = createSlice<S,A>(
  reducer,
  initialState,
  name,
  (useDispatch) => () => {
    const dispatch = useDispatch();
    const increment = () => dispatch({ type: INCREMENT });
    return { [name]: { increment } };
  },
  ["value"]
);
```

The last parameter, the array of keys, is optional. If not given is an empty array. I have put it in this example in case you need to persist some data in your local storage while using this library. A tipical scenario would be for example a dark/light mode. We want when the user refresh the page to stay in the mode he chose. In case you use this feature I advice you to select specific names, like **_counterValue_** rather than **_value_**. If you do this, then this will need to be changed as well:

```javascript
type S = {
  counterValue: number,
};

const initialState: S = { counterValue: 0 };
```

The **_useLocalStorage_** hook is a hook you can find on internet.

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
