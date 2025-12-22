/**
 * Parses a request body into an object if the body was JSON, or text if not.
 *
 * There is not more extensive content type checking because Apollo Server does
 * validation on the parsed body (see [source][1]).
 *
 * [1]: https://github.com/apollographql/apollo-server/blob/7be3686ae62fb04bb4d0bfddb465d5e89631d4e4/packages/server/src/runHttpQuery.ts#L136-L184
 *
 * @throws {Response} A Response object with status 400 if JSON parsing fails
 */
export default async function parseBody(request: Request) {
  const contentType = request.headers.get('Content-Type') ?? ''

  if (request.method === 'POST' && contentType.includes('application/json')) {
    try {
      return await request.json()
    } catch (error) {
      /**
       * Expo's `StatusError` cannot be used to abort the request because the
       * response will be a JSON object with the `error` key set to the error
       * message (see [documentation][1] and [source][2]) while Apollo Server
       * expects the response to be the error message text (see [tests][3]).
       *
       * [1]: https://docs.expo.dev/router/web/api-routes/#error-handling
       * [2]: https://github.com/expo/expo/blob/9d6f808e858f539dd534fb27b838abae1719604f/packages/expo-server/src/runtime/error.ts#L18
       * [3]: https://github.com/apollographql/apollo-server/blob/7be3686ae62fb04bb4d0bfddb465d5e89631d4e4/packages/integration-testsuite/src/httpServerTests.ts#L376-L390
       */
      if (
        typeof error === 'object' &&
        error !== null &&
        'message' in error &&
        typeof error.message === 'string'
      ) {
        throw new Response(error.message, { status: 400 })
      } else {
        throw new Response('Invalid JSON', { status: 400 })
      }
    }
  } else {
    return await request.text()
  }
}
