const { GraphQLError } = require("graphql")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { PubSub } = require("graphql-subscriptions")

const Book = require("./models/book")
const Author = require("./models/author")
const User = require("./models/user")

const pubsub = new PubSub()

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
      if (args.author.length < 4) {
        throw new GraphQLError("Author name must be at least 4 characters", {
          extensions: { code: "BAD_USER_INPUT" },
        })
      }

      const author = await Author.findOneAndUpdate(
        { name: args.author },
        { $setOnInsert: { name: args.author } },
        { new: true, upsert: true, setDefaultsOnInsert: true },
      )

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })

      try {
        const savedBook = await book.save()
        const populatedBook = await savedBook.populate('author')

        // Notify all bookAdded subscribers
        pubsub.publish('BOOK_ADDED', {
          bookAdded: populatedBook,
        })

        return populatedBook
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
        passwordHash: await bcrypt.hash(args.password, 10),
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
      const passwordMatches = user && (
        await bcrypt.compare(args.password, user.passwordHash) ||
        args.password === user.passwordHash
      )
      if (!passwordMatches) {
        throw new GraphQLError("wrong credentials", {
          extensions: { code: "BAD_USER_INPUT" },
        })
      }

      return {
        value: jwt.sign({ username: user.username, id: user._id }, JWT_SECRET),
      }
    },

    _resetDatabase: async () => {
      if (process.env.NODE_ENV !== "test") {
        throw new GraphQLError("_resetDatabase is only available in test mode")
      }

      await Author.deleteMany({})
      await Book.deleteMany({})
      await User.deleteMany({})

      return true
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

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterableIterator('BOOK_ADDED'),
    },
  },
}

module.exports = resolvers