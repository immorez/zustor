import { createQueryHook } from './createQueryHook';
import { createMutationHook } from './createMutationHook';
import { GenerateHookTypes, HookConfig, ZuskitStore } from '../types';

export function createApi<Config extends HookConfig>(
  hookConfig: Config,
  store: ZuskitStore,
): GenerateHookTypes<Config> {
  const hooks: Record<string, any> = {};

  // Generate Query Hooks
  if (hookConfig.queries) {
    for (const [endpoint, { queryFn, config }] of Object.entries(
      hookConfig.queries,
    )) {
      const hookName =
        `use${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}Query` as const;
      hooks[hookName] = createQueryHook([endpoint], queryFn, config, store);
    }
  }

  // Generate Mutation Hooks
  if (hookConfig.mutations) {
    for (const [endpoint, { mutationFn }] of Object.entries(
      hookConfig.mutations,
    )) {
      const hookName =
        `use${endpoint.charAt(0).toUpperCase() + endpoint.slice(1)}Mutation` as const;
      hooks[hookName] = createMutationHook([endpoint], mutationFn, store);
    }
  }

  return hooks as GenerateHookTypes<Config>;
}
