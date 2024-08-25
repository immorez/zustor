import { create } from 'zustand';

type QueryHook<T> = () => {
  data: T;
  refetch: () => Promise<void>;
};

type MutationHook<T> = () => {
  mutate: (input: any) => Promise<T>;
};

export interface QueryConfig<QueryResult> {
  cacheTime?: number;
  onSuccess?: (data: QueryResult) => void;
  onError?: (error: unknown) => void;
}

export interface EndpointConfig<QueryResult> {
  queryFn: () => Promise<QueryResult>;
  config?: Partial<QueryConfig<QueryResult>>;
}

export interface MutationConfig<MutationInput, MutationResult> {
  mutationFn: (data: MutationInput) => Promise<MutationResult>;
}

export interface ZustorConfig {
  queries?: Record<string, EndpointConfig<unknown>>;
  mutations?: Record<string, MutationConfig<unknown, unknown>>;
}

export type QueryKey = ReadonlyArray<unknown>;
export type MutationKey = ReadonlyArray<unknown>;

export type ZustorStore = ReturnType<typeof create>;

export type GenerateHookTypes<Config extends ZustorConfig> = {
  // Map over query endpoints to create `useXQuery` hooks
  [K in keyof Config['queries'] as `use${Capitalize<string & K>}Query`]: QueryHook<
    ReturnType<Config['queries'][K]['queryFn']>
  >;
} & {
  // Map over mutation endpoints to create `useXMutation` hooks
  [K in keyof Config['mutations'] as `use${Capitalize<string & K>}Mutation`]: MutationHook<
    ReturnType<Config['mutations'][K]['mutationFn']>
  >;
};
