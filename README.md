# Apollo Server Integration Expo

An [Apollo Server](https://www.apollographql.com/docs/apollo-server) integration for use with [Expo API Routes](https://docs.expo.dev/router/web/api-routes/).

## Getting started

1. Install the integration, along with its peer dependencies if not already installed:

   ```bash
   npm install @as-integrations/expo @apollo/server graphql
   ```

2. In the file for the GraphQL endpoint, start the server and export the handlers for the `GET`, `HEAD`, and `POST` HTTP methods:

   ```typescript
   // File: app/graphql+api.ts
   // Endpoint: /graphql

   import { ApolloServer } from '@apollo/server'
   import startServerAndCreateHandler from '@as-integrations/expo'

   const server = new ApolloServer({ ... })

   export const { GET, HEAD, POST } = startServerAndCreateHandler(server)
   ```

   For the options passed into `ApolloServer`, see [Apollo Server documentation](https://www.apollographql.com/docs/apollo-server/api/apollo-server).

3. Requests can now be made to the `/graphql` endpoint. Visiting `/graphql` when serving from a server running in development mode will show the [Apollo Sandbox](https://www.apollographql.com/docs/graphos/platform/sandbox).

## Computing GraphQL context

During a GraphQL operation, data such as the HTTP request can be passed to GraphQL resolvers and server plugins. This is done via the `context` option, a function which is given the `Request` and returns an object representing the context. Below is an example:

```typescript
import { ApolloServer } from '@apollo/server'
import startServerAndCreateHandler from '@as-integrations/expo'

type Context = {
  request: Request
}

const server = new ApolloServer<Context>({
  // ...

  resolvers: {
    Query: {
      resolver: (parent, args, context, info) => {
        // The request will be accessible via `context.request`. The type
        // definition comes from the `Context` type passed to `ApolloServer`.
      },
    },
  },
})

export const { GET, HEAD, POST } = startServerAndCreateHandler(server, {
  context: async (request) => {
    // The `request` parameter is a Fetch standard `Request` object.

    // The return must match the shape of `Context`. In this example,
    // the request is assigned to the `request` key on the context object,
    // however, this function can compute its own context in whatever way
    // you desire.
    return { request }
  },
})
```

See [Apollo Server documentation](https://www.apollographql.com/docs/apollo-server/data/context#the-contextvalue-object) for more information.
