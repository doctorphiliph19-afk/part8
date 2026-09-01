const { ApolloServer } = require("@apollo/server")
const { ApolloServerPluginDrainHttpServer } = require("@apollo/server/plugin/drainHttpServer")
const { expressMiddleware } = require("@as-integrations/express5")
const cors = require("cors")
const express = require("express")
const { makeExecutableSchema } = require("@graphql-tools/schema")
const http = require("http")
const { WebSocketServer } = require("ws")
const { useServer } = require("graphql-ws/use/ws")
const jwt = require("jsonwebtoken")

const typeDefs = require("./schema")
const resolvers = require("./resolvers")
const User = require("./models/user")

const JWT_SECRET = process.env.JWT_SECRET || "exercise-secret"

const getUserFromAuthHeader = async (auth) => {
  if (!auth || !auth.startsWith("Bearer ")) {
    return null
  }

  try {
    const decodedToken = jwt.verify(
      auth.substring(7),
      JWT_SECRET,
    )

    return User.findById(decodedToken.id)
  } catch (error) {
    return null
  }
}

const startServer = async (port) => {
  const app = express()

  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
  })

  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/",
  })

  const serverCleanup = useServer(
    {
      schema,
    },
    wsServer,
  )

  const server = new ApolloServer({
    schema,

    plugins: [
      ApolloServerPluginDrainHttpServer({
        httpServer,
      }),

      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
    ],
  })

  await server.start()

  app.use(
    "/",
    cors(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => {
        const auth = req.headers.authorization

        const currentUser =
          await getUserFromAuthHeader(auth)

        return {
          authorization: auth,
          currentUser,
        }
      },
    }),
  )

  httpServer.listen(port, () => {
    console.log(
      `Server is now running on http://localhost:${port}`,
    )
  })
}

module.exports = startServer