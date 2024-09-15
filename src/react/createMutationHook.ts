import { useState } from 'react';
import { hashKey, log } from '../utils'; // Assuming `log` function is defined in utils
import { ZustorStore } from '../types';

export function createMutationHook(
  key: ReadonlyArray<unknown>,
  mutationFn: (data: unknown) => Promise<unknown>,
  config: {
    onError?: (error: Error) => void;
    onSuccess?: (result: unknown) => void;
  } = {},
  store: ZustorStore,
) {
  const hashedKey = hashKey(key);
  return function useMutation() {
    const { setState } = store;

    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const mutate = async (data: unknown) => {
      setIsLoading(true);
      setIsError(false);
      setIsSuccess(false);
      setError(null);

      log(
        'info',
        `[MUTATION] Start mutation for key: ${hashedKey} with data:`,
        data,
      );

      try {
        const result = await mutationFn(data);
        setState((state: object) => ({ ...state, [hashedKey]: result }));

        log(
          'info',
          `[MUTATION] Successfully mutated data for key: ${hashedKey}`,
          result,
        );

        setIsSuccess(true);
        if (config.onSuccess) {
          log('info', `[MUTATION] Success callback for key: ${hashedKey}`);
          config.onSuccess(result);
        }
        return result;
      } catch (err) {
        const error = err as Error;
        log(
          'error',
          `[MUTATION] Error during mutation for key: ${hashedKey}`,
          error,
        );

        setIsError(true);
        setError(error);
        if (config.onError) {
          log('info', `[MUTATION] Error callback for key: ${hashedKey}`);
          config.onError(error);
        }
        throw error;
      } finally {
        setIsLoading(false);
        log(
          'info',
          `[MUTATION] Mutation process finished for key: ${hashedKey}`,
        );
      }
    };

    return {
      mutate,
      isLoading,
      isError,
      isSuccess,
      error,
    };
  };
}
