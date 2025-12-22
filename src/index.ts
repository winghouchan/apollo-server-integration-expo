import {
  ApolloServer,
  BaseContext,
  ContextFunction,
  HeaderMap,
} from '@apollo/server'
import parseBody from './parseBody'

type Handler = (request: Request) => Promise<Response>
type Handlers = { GET: Handler; HEAD: Handler; POST: Handler }
type Options<Context extends BaseContext> = {
  context?: ContextFunction<[Request], Context>
}

/**
 * Creates an Apollo Server request handler for Expo API Routes.
 *
 * Starts the Apollo Server in the background and returns handler functions
 * for processing GraphQL requests sent to different HTTP methods. The handler
 * accepts a `Request`, parses it, executes the GraphQL request using Apollo,
 * and then returns a `Response` with the result of executing the request.
 *
 * @example
 * ```ts
 * // app/graphql+api.ts
 *
 * const server = new ApolloServer( ... )
 *
 * export const { GET, HEAD, POST } = startServerAndCreateHandler(server, {
 *   context: async (request) => { ... },
 * })
 * ```
 *
 * @see [Documentation on using the Apollo Server Expo integration](../README.md)
 * @see {@link https://www.apollographql.com/docs/apollo-server/integrations/integration-index | Documentation on Apollo Server integrations}
 * @see {@link https://www.apollographql.com/docs/apollo-server/integrations/building-integrations#handle-requests | Documentation on building Apollo Server integrations}
 */
function startServerAndCreateHandler(
  server: ApolloServer<BaseContext>,
  options?: Options<BaseContext>,
): Handlers
function startServerAndCreateHandler<Context extends BaseContext>(
  server: ApolloServer<Context>,
  options: Required<Pick<Options<Context>, 'context'>> & Options<Context>,
): Handlers
function startServerAndCreateHandler<Context extends BaseContext>(
  server: ApolloServer<Context>,
  options?: Options<Context>,
): Handlers {
  server.startInBackgroundHandlingStartupErrorsByLoggingAndFailingAllRequests()

  const defaultContext: Exclude<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Options<any>['context'],
    undefined
  > = async () => ({})
  const contextFunction = options?.context ?? defaultContext

  async function handler(request: Request) {
    const httpGraphQLRequest = {
      body: await parseBody(request),
      headers: new HeaderMap(request.headers),
      method: request.method,
      search: new URL(request.url).searchParams.toString(),
    }

    const context = () => contextFunction(request)

    const httpGraphQLResponse = await server.executeHTTPGraphQLRequest({
      httpGraphQLRequest,
      context,
    })

    const response = {
      headers: new Headers(Object.fromEntries(httpGraphQLResponse.headers)),
      ...(typeof httpGraphQLResponse.status === 'number'
        ? { status: httpGraphQLResponse.status }
        : {}),
    } satisfies ResponseInit

    switch (httpGraphQLResponse.body.kind) {
      case 'chunked': {
        const iterator = httpGraphQLResponse.body.asyncIterator

        return new Response(
          new ReadableStream({
            async pull(controller) {
              const { value, done } = await iterator.next()

              return done
                ? controller.close()
                : controller.enqueue(new TextEncoder().encode(value))
            },
          }),
          response,
        )
      }
      case 'complete': {
        response.headers.set(
          'Content-Length',
          Buffer.byteLength(httpGraphQLResponse.body.string).toString(),
        )

        return new Response(httpGraphQLResponse.body.string, response)
      }
    }
  }

  return { GET: handler, HEAD: handler, POST: handler }
}

export default startServerAndCreateHandler
