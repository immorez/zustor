import { createQueryHook } from './createQueryHook';
import { createMutationHook } from './createMutationHook';
import { ZustorStore, ZustorConfig, GenerateHookTypes } from '../types';

const zustorClient = () => {
  let internalStore: ZustorStore | null = null;

  const initialize = (store: ZustorStore) => {
    internalStore = store;
  };

  const useQuery = (
    key: ReadonlyArray<unknown>,
    queryFn: () => Promise<unknown>,
    config: any = {},
  ) => {
    if (!internalStore) {
      throw new Error(
        'Zustor store is not initialized. Please initialize the client first.',
      );
    }
    return createQueryHook(key, queryFn, config, internalStore);
  };

  const useMutation = (
    key: ReadonlyArray<unknown>,
    mutationFn: (data: any) => Promise<unknown>,
    config: any = {},
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

    const hooks: Record<string, any> = {};

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
      for (const [endpoint, { mutationFn }] of Object.entries(
        hookConfig.mutations,
      )) {
        const hookName =
          `use${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}Mutation` as const;
        hooks[hookName] = useMutation([endpoint], mutationFn);
      }
    }

    return hooks as GenerateHookTypes<Config>;
  };

  return {
    initialize,
    createApi,
  };
};

export default zustorClient;
