import { ApolloServer } from '@apollo/server'
import { describe, expect, jest, test } from '@jest/globals'
import startServerAndCreateHandler from '.'

jest.mock('@apollo/server')

describe('startServerAndCreateHandler', () => {
  /**
   * An Expo API route handler exports functions named after the HTTP method
   * the function handles. `startServerAndCreateHandler` is designed to return
   * an object with handlers for the methods that Apollo Server handles. Methods
   * that Apollo Server handles can be checked via the integration test suite
   * from Apollo Server ([source][1]).
   *
   * This test is only intended to check the start function returns handlers in
   * a suitable way for Expo API Routes. It does not intend to check the methods
   * are handled correctly.
   *
   * [1]: https://github.com/apollographql/apollo-server/tree/main/packages/integration-testsuite
   */
  test('returns a handler for `GET`, `HEAD`, and `POST` HTTP methods', () => {
    const handlers = startServerAndCreateHandler(
      new ApolloServer({ typeDefs: ``, resolvers: {} }),
    )

    expect(handlers).toHaveProperty('GET')
    expect(handlers).toHaveProperty('HEAD')
    expect(handlers).toHaveProperty('POST')
  })
})
