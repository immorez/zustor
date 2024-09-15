import { create } from 'zustand';

export type QueryKey = ReadonlyArray<unknown>;

export type MutationKey = ReadonlyArray<unknown>;

type QueryHook<T> = (hookConfig?: Partial<QueryConfig<unknown>>) => {
  data: T;
  isLoading: boolean;
  isFetching: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
};

type MutationHook<T> = () => {
  mutate: (input: unknown) => Promise<T>;
  isLoading: boolean;
  error: Error | null;
};

export interface QueryConfig<QueryResult> {
  params?: Record<string, unknown>;
  cacheTime?: number;
  onSuccess?: (data: QueryResult) => void;
  onError?: (error: unknown) => void;
}

export interface MutationConfig<MutationResult> {
  onSuccess?: (data: MutationResult) => void;
  onError?: (error: unknown) => void;
}

export interface QueryObjectConfig<QueryResult> {
  queryFn: (params?: Record<string, unknown>) => Promise<QueryResult>;
  config?: Partial<QueryConfig<QueryResult>>;
}

export interface MutationObjectConfig<MutationInput, MutationResult> {
  mutationFn: (data: MutationInput) => Promise<MutationResult>;
  config?: Partial<MutationConfig<MutationResult>>;
}

export interface ZustorConfig {
  queries?: Record<string, QueryObjectConfig<unknown>>;
  mutations?: Record<string, MutationObjectConfig<unknown, unknown>>;
}

// If queryFn return type is a promise, return what's inside promise.
// Otherwise, return the actual returned value's type.
export type AwaitedResult<T> = T extends PromiseLike<infer U> ? U : T;

export type ZustorStore = ReturnType<typeof create>;

export type GenerateHookTypes<Config extends ZustorConfig> = {
  [K in keyof Config['queries'] as `use${Capitalize<string & K>}Query`]: QueryHook<
    AwaitedResult<ReturnType<Config['queries'][K]['queryFn']>>
  >;
} & {
  [K in keyof Config['mutations'] as `use${Capitalize<string & K>}Mutation`]: MutationHook<
    AwaitedResult<ReturnType<Config['mutations'][K]['mutationFn']>>
  >;
};
