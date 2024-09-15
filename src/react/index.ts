import { createQueryHook } from './createQueryHook';
import { createMutationHook } from './createMutationHook';
import {
  ZustorStore,
  ZustorConfig,
  GenerateHookTypes,
  QueryConfig,
  MutationConfig,
} from '../types';
import { hashKey } from '../utils';

const zustorClient = () => {
  let internalStore: ZustorStore | null = null;
  let manualInvalidatedQueries: string[] = [];
  const initialize = (store: ZustorStore) => {
    internalStore = store;
  };

  const useQuery = (
    key: ReadonlyArray<unknown>,
    queryFn: () => Promise<unknown>,
    config: Partial<QueryConfig<unknown>>,
  ) => {
    if (!internalStore) {
      throw new Error(
        'Zustor store is not initialized. Please initialize the client first.',
      );
    }
    return createQueryHook(
      key,
      queryFn,
      config,
      internalStore,
      manualInvalidatedQueries,
    );
  };

  const useMutation = (
    key: ReadonlyArray<unknown>,
    mutationFn: (data: unknown) => Promise<unknown>,
    config: Partial<MutationConfig<unknown>>,
  ) => {
    if (!internalStore) {
      throw new Error(
        'Zustor store is not initialized. Please initialize the client first.',
      );
    }
    return createMutationHook(key, mutationFn, config, internalStore);
  };

  const createApi = <Config extends ZustorConfig>(
    hookConfig: Config,
  ): GenerateHookTypes<Config> => {
    if (!internalStore) {
      throw new Error(
        'Zustor store is not initialized. Please initialize the client first.',
      );
    }

    const hooks: Record<string, unknown> = {};

    // Generate Query Hooks
    if (hookConfig.queries) {
      for (const [endpoint, { queryFn, config }] of Object.entries(
        hookConfig.queries,
      )) {
        const hookName =
          `use${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}Query` as const;
        hooks[hookName] = useQuery([endpoint], queryFn, config);
      }
    }

    // Generate Mutation Hooks
    if (hookConfig.mutations) {
      for (const [endpoint, { mutationFn, config }] of Object.entries(
        hookConfig.mutations,
      )) {
        const hookName =
          `use${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}Mutation` as const;
        hooks[hookName] = useMutation([endpoint], mutationFn, config);
      }
    }

    return hooks as GenerateHookTypes<Config>;
  };

  const invalidate = (key: ReadonlyArray<unknown>) => {
    if (!internalStore) {
      throw new Error(
        'Zustor store is not initialized. Please initialize the client first.',
      );
    }

    const hashedKey = hashKey(key);

    if (!manualInvalidatedQueries.includes(hashedKey))
      manualInvalidatedQueries.push(hashedKey);

    internalStore.setState((state: object) => {
      const newState = { ...state };
      delete newState[hashedKey];
      return newState;
    });
  };

  return {
    initialize,
    createApi,
    invalidate,
  };
};

export default zustorClient;
