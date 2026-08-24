const { GraphQLError } = require("graphql")
const jwt = require("jsonwebtoken")

const Book = require("./models/book")
const Author = require("./models/author")
const User = require("./models/user")

const JWT_SECRET = process.env.JWT_SECRET || "exercise-secret"

const getUserFromToken = async (authorization, currentUser) => {
  if (currentUser) {
    return currentUser
  }

  if (!authorization || !authorization.startsWith("Bearer ")) {
    return null
  }

  try {
    const decodedToken = jwt.verify(authorization.replace("Bearer ", ""), JWT_SECRET)
    return User.findById(decodedToken.id)
  } catch (error) {
    return null
  }
}

const requireUser = async context => {
  const user = await getUserFromToken(context.authorization, context.currentUser)
  if (!user) {
    throw new GraphQLError("not authenticated", {
      extensions: { code: "UNAUTHENTICATED" },
    })
  }
  return user
}

const resolvers = {
  Query: {
    bookCount: async () => {
      return Book.countDocuments({})
    },

    authorCount: async () => {
      return Author.countDocuments({})
    },

    allBooks: async (root, args) => {
      // Filter books by author
      if (args.author) {
        const author = await Author.findOne({
          name: args.author,
        })

        if (!author) {
          return []
        }

        return Book.find({
          author: author._id,
        })
      }

      // Filter books by genre
      if (args.genre) {
        return Book.find({
          genres: args.genre,
        })
      }

      // Return all books
      return Book.find({})
    },

    allAuthors: async () => {
      return Author.find({})
    },

    me: async (root, args, context) =>
      getUserFromToken(context.authorization, context.currentUser),
  },

  Mutation: {
    addBook: async (root, args, context) => {
      await requireUser(context)
      const author = await Author.findOne({
        name: args.author,
      })

      if (!author) {
        throw new GraphQLError("Author not found", {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        })
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })

      try {
        return await book.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        })
      }
    },

    addAuthor: async (root, args) => {
      const author = new Author({
        name: args.name,
        born: args.born,
      })

      try {
        return await author.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        })
      }
    },

    editAuthor: async (root, args, context) => {
      await requireUser(context)
      const author = await Author.findOne({
        name: args.name,
      })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      try {
        return await author.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: {
            code: "BAD_USER_INPUT",
          },
        })
      }
    },

    createUser: async (root, args) => {
      const user = new User({
        username: args.username,
        favoriteGenre: args.favoriteGenre,
        passwordHash: "secret",
      })

      try {
        return await user.save()
      } catch (error) {
        throw new GraphQLError(error.message, {
          extensions: { code: "BAD_USER_INPUT" },
        })
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })
      if (!user || args.password !== "secret") {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        })
      }

      return {
        value: jwt.sign({ username: user.username, id: user._id }, JWT_SECRET),
      }
    },
  },

  Book: {
    author: async (root) => {
      return Author.findById(root.author)
    },
  },

  Author: {
    bookCount: async (root) => {
      return Book.countDocuments({
        author: root._id,
      })
    },
  },
}

module.exports = resolvers