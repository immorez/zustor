# Zuskit

**Zuskit** is a lightweight and flexible data-fetching library that combines the power of Zustand for state management with efficient query capabilities. It allows you to effortlessly manage server-state, caching, and mutations by dynamically generating hooks from your API configuration.

## Features

- **Dynamic Hook Generation**: Create query and mutation hooks based on your API configuration with ease.
- **Custom Fetch Functions**: Pass in your own fetch functions and customize the behavior of your queries and mutations.
- **Zustand-Based Caching**: Leverage Zustand's store to cache query results and manage state.
- **Cache Invalidation & Polling**: Easily manage cache invalidation and polling intervals for up-to-date data.
- **TypeScript Support**: Strongly typed API for a seamless development experience.

## Installation

Install Zuskit along with Zustand:

bash

`npm install zustand zuskit`

or

`yarn add zustand zuskit`

## Basic Usage

### 1\. Setting Up Queries and Mutations

First, define your queries and mutations in a configuration object:

typescript

```typescript
import create from 'zustand';
import { createApi } from 'zuskit';

const apiConfig = {
  queries: {
    getUser: {
      queryFn: () => fetch('/api/user').then((res) => res.json()),
    },
    getPosts: {
      queryFn: () => fetch('/api/posts').then((res) => res.json()),
    },
  },
  mutations: {
    updateUser: {
      mutationFn: (data) =>
        fetch('/api/user', {
          method: 'PUT',
          body: JSON.stringify(data),
        }).then((res) => res.json()),
    },
  },
};

// Create a Zustand store instance
const useStore = create(() => ({}));

// Generate hooks based on your API configuration
const { useGetUserQuery, useGetPostsQuery, useUpdateUserMutation } = createApi(
  apiConfig,
  useStore,
);
```

### 2\. Using Generated Hooks in Components

Now, use the generated hooks in your React components:

```typescript
import React from 'react';
import { useGetUserQuery } from './store/api'; // Adjust import path as needed

function UserProfile() {
  const { data: user, refetch } = useGetUserQuery();

  return (
    <div>
      <h1>{user.name}</h1>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}

export default UserProfile;
```

### 3\. Performing Mutations

Use the mutation hooks to update data:

```typescript
import React from 'react';
import { useUpdateUserMutation } from './store/api'; // Adjust import path as needed

function UpdateUserForm() {
  const { mutate: updateUser } = useUpdateUserMutation();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = { name: event.currentTarget.name.value };
    updateUser(data);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" placeholder="Enter new name" />
      <button type="submit">Update</button>
    </form>
  );
}

export default UpdateUserForm;

```

## Advanced Features

### Cache Invalidation & Polling

Zuskit provides built-in support for cache invalidation and polling intervals, allowing you to keep your data fresh.

### Customizing the Cache Key

Zuskit allows you to customize the cache key by passing an array as the key and serializing it. Strings are placed first and sorted, followed by objects with structural sharing, similar to React Query.

## API

### `createApi(hookConfig: HookConfig, store: ZuskitStore)`

- **`hookConfig`**: Configuration object containing queries and mutations.
- **`store`**: Zustand store instance to manage the state.

This function returns an object containing the dynamically generated hooks based on the provided configuration.

### `Query Hook`

- **`data`**: The fetched data.
- **`refetch`**: Function to refetch the data.

### `Mutation Hook`

- **`mutate`**: Function to trigger the mutation.

## License

This project is licensed under the MIT License.
