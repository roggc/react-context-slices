declare module "react-context-slices" {
  type ContextProviderType = ({
    children,
  }: React.PropsWithChildren) => JSX.Element;
  export declare const getHookAndProviderFromSlices: (
    slices: {
      [key: string]: any;
    },
    persist?: {
      [key: string]: boolean;
    },
    AsyncStorage?: any
  ) => {
    useSlice: (name: string) => any[];
    Provider: ContextProviderType;
  };
}
