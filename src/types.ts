interface QueryConfig<QueryResult> {
  cacheTime?: number;
  onSuccess?: (data: QueryResult) => void;
  onError?: (error: unknown) => void;
}

interface EndpointConfig<QueryResult> {
  queryFn: () => Promise<QueryResult>;
  config?: Partial<QueryConfig<QueryResult>>;
}

interface MutationConfig<MutationInput, MutationResult> {
  mutationFn: (data: MutationInput) => Promise<MutationResult>;
}

interface HookConfig {
  queries?: Record<string, EndpointConfig<unknown>>;
  mutations?: Record<string, MutationConfig<unknown, unknown>>;
}

type QueryKey = ReadonlyArray<unknown>
type MutationKey = ReadonlyArray<unknown>