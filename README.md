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
