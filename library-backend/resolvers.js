const { GraphQLError } = require("graphql")

const Book = require("./models/book")
const Author = require("./models/author")

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
  },

  Mutation: {
    addBook: async (root, args) => {
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

    editAuthor: async (root, args) => {
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