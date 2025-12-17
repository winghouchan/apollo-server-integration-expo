import { ApolloServer } from '@apollo/server'
import { defineIntegrationTestSuite } from '@apollo/server-integration-testsuite'
import { createRequestHandler } from 'expo-server/adapter/abstract'
import { convertRequest } from 'expo-server/adapter/http'
import { createServer } from 'http'
import { AddressInfo } from 'net'
import { Readable } from 'stream'
import startServerAndCreateHandler from '.'

/**
 * Mocks an Expo server.
 *
 * An Expo Server handles requests by looking in a manifest file to find the
 * handler for a particular route, then importing the handler and executing it.
 * The manifest file is generated from the contents of the `app` directory when
 * `expo export` is run.
 *
 * The mock replaces the file system with an in-memory version by replacing the
 * functions that reads the manifest with one that returns an object mocking the
 * manifest, and the function that imports the file with the handler with one
 * that returns an object representing the handler. Mocks for HTML routes and
 * middleware are not implemented because they have no purpose in the tests.
 *
 * @see {@link https://github.com/expo/expo/blob/0e2c03bda06df475b0fcb0d58c67c10a12dd2b69/packages/expo-server/src/vendor/abstract.ts | Source code for Expo Server's request handler}
 * @see {@link https://docs.expo.dev/router/web/api-routes/ | Documentation for Expo API Routes}
 */
async function mockServer(routes: {
  [key: string]: {
    [key: string]: (request: Request) => Promise<Response>
  }
}) {
  const handler = createRequestHandler({
    async getApiRoute({ page }) {
      return routes[page]
    },
    async getHtml() {
      throw new Error('`getHtml` mock not implemented')
    },
    async getMiddleware() {
      throw new Error('`getMiddleware` mock not implemented')
    },
    async getRoutesManifest() {
      return {
        apiRoutes: Object.keys(routes).map((route) => ({
          file: '',
          page: route,
          namedRegex: new RegExp(`^${route}$`),
          routeKeys: {},
        })),
        htmlRoutes: [],
        notFoundRoutes: [],
        redirects: [],
        rewrites: [],
      }
    },
  })

  const httpServer = createServer(async (request, response) => {
    const result = await handler(convertRequest(request, response))

    response.statusCode = result.status
    response.setHeaders(result.headers)

    return result.body
      ? Readable.fromWeb(result.body).pipe(response)
      : response.end()
  })

  await new Promise<void>((resolve) => {
    httpServer.listen({ port: 0 }, resolve)
  })

  return httpServer
}

defineIntegrationTestSuite(
  async (serverOptions, testOptions) => {
    const server = new ApolloServer(serverOptions)
    const httpServer = await mockServer({
      '/': startServerAndCreateHandler(server, testOptions),
    })
    const { port } = httpServer.address() as AddressInfo

    return {
      server,
      url: `http://localhost:${port}`,
      async extraCleanup() {
        return await new Promise<void>((resolve, reject) => {
          httpServer.close((error) => (error ? reject(error) : resolve()))
        })
      },
    }
  },
  { serverIsStartedInBackground: true },
)
