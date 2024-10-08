# Zustor

**Zustor** is a lightweight and flexible data-fetching library that combines the power of Zustand for state management with efficient query capabilities. It allows you to effortlessly manage server-state, caching, and mutations by dynamically generating hooks from your API configuration.

# Disclaimer

Important Notice: Zustor is provided as-is. While every effort has been made to ensure its quality and reliability, it may not cover all edge cases or meet every production requirement. Users are responsible for evaluating its suitability for their specific use case and testing thoroughly before deploying it to production environments. The maintainers are not liable for any issues, including but not limited to data loss or system failures, that arise from using this package.

## Features

- **Dynamic Hook Generation**: Create query and mutation hooks based on your API configuration with ease.
- **Custom Fetch Functions**: Pass in your own fetch functions and customize the behavior of your queries and mutations.
- **Zustand-Based Caching**: Leverage Zustand's store to cache query results and manage state.
- **Cache Invalidation & Polling**: Easily manage cache invalidation and polling intervals for up-to-date data.
- **TypeScript Support**: Strongly typed API for a seamless development experience.

## Installation

Install Zustor along with Zustand:

bash

`npm install zustand zustor`

or

`yarn add zustand zustor`

## Basic Usage

### 1\. Initialize Zustor client

First, create a new Zustor instance and provide it with Zustand store:

```typescript
import { zustorClient } from 'zustor';
import { create } from 'zustand';

// Create a Zustand store instance
const useStore = create(() => ({}));

// Initialize zustor client
export const zustor = zustorClient().initialize(store);
```

### 2\. Setting Up Queries and Mutations

Then, define your queries and mutations in a configuration object:

```typescript
import { zustor } from './path-to-store-file';

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

// Generate hooks based on your API configuration
const { useGetUserQuery, useGetPostsQuery, useUpdateUserMutation } =
  zustor.createApi(apiConfig);
```

### 3\. Using Generated Hooks in Components

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

### 4\. Performing Mutations

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

### Query Parameters Support

**Zustor** now supports query parameters in its query hooks, enabling more dynamic and flexible data fetching. This feature allows you to pass parameters to your query functions, which can be used to build URLs or modify the request based on the provided parameters.

#### How It Works

1.  **Define Query Function with Parameters**: Update your query function to accept parameters and use them to customize the request.

    ```typescript
    const getComments = async (params: { postId: number }) => {
      const response = await fetch(`/api/comments?postId=${params.postId}`);
      return response.json();
    };
    ```

2.  **Update Query Configuration**: Ensure your query configuration includes parameter support.

    ```typescript
    const apiConfig = {
      queries: {
        getComments: {
          queryFn: getComments,
        },
      },
    };
    ```

3.  **Use the Hook with Parameters**: When using the generated hook, pass the necessary parameters.

    ```typescript
    import { useGetCommentsQuery } from './store/api'; // Adjust import path as needed

    function CommentsList({ postId }: { postId: number }) {
      const { data: comments, refetch } = useGetCommentsQuery({ postId });

      return (
        <div>
          <button onClick={refetch}>Refresh Comments</button>
          <ul>
            {comments?.map(comment => (
              <li key={comment.id}>{comment.text}</li>
            ))}
          </ul>
        </div>
        );
      }
    ```

## API

### `createApi(hookConfig: ZustorConfig)`

- **`hookConfig`**: Configuration object containing queries and mutations.

This function returns an object containing the dynamically generated hooks based on the provided configuration.

### `Query Hook`

- **`data`**: The fetched data.
- **`isLoading`**: Indicates if the data is currently being loaded.
- **`isFetching`**: Indicates if the data is being fetched in the background.
- **`error`**: Error, if any occurred during data fetching.
- **`refetch`**: Function to refetch the data.
- **`config`**: Optional configuration to customize the query behavior, such as parameters, cache time, and success/error callbacks.

### `Mutation Hook`

- **`mutate`**: Function to trigger the mutation.
- **`isLoading`**: Indicates if the mutation is currently in progress.
- **`error`**: Error, if any occurred during the mutation.
- **`config`**: Optional configuration to customize the mutation behavior, such as success/error callbacks.

## Contributing

We welcome contributions to `zustor`! If you would like to contribute, please follow these steps:

1.  **Fork the Repository:** Create a personal fork of the repository by clicking the "Fork" button at the top right of this page.

2.  **Clone Your Fork:** Clone your fork to your local machine.

    `git clone https://github.com/immorez/zustor.git`

3.  **Create a Branch:** Create a new branch for your changes.

    `git checkout -b my-feature-branch`

4.  **Make Your Changes:** Implement your feature or fix your bug. Be sure to write tests for your changes if applicable.

5.  **Commit Your Changes:** Commit your changes with a descriptive message.

    `git commit -m "Add feature X or fix issue Y"`

6.  **Push Your Changes:** Push your changes to your fork.

    `git push origin my-feature-branch`

7.  **Create a Pull Request:** Go to the original repository and create a pull request from your branch. Provide a clear description of your changes and why they are necessary.

8.  **Review and Feedback:** Your pull request will be reviewed by the maintainers. Be open to feedback and ready to make any necessary revisions.

## TODO

[] - 🛠️ Add support for SSR (Server-Side Rendering)

[] - 🚀 Implement caching strategies and optimizations

[] - ⏲️ Improve query and mutation polling mechanisms

[] - 📄 Enhance documentation and examples

[] - 🔧 Add more robust error handling

[] - 🧪 Write comprehensive test coverage

[] - 🔌 Implement WebSocket (Real-time) updates

[] - Documentation web page

## License

This project is licensed under the MIT License.
