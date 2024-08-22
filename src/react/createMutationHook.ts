import { hashKey } from '../utils';
import { ZuskitStore } from '../types';

export function createMutationHook(
  key: ReadonlyArray<unknown>,
  mutationFn: (data: any) => Promise<any>,
  store: ZuskitStore,
) {
  const hashedKey = hashKey(key);
  return function useMutation() {
    const { setState } = store;

    const mutate = async (data: any) => {
      try {
        const result = await mutationFn(data);
        setState((state) => ({ ...state, [hashedKey]: result }));
        return result;
      } catch (error) {
        throw error;
      }
    };

    return {
      mutate,
    };
  };
}
