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
        throw new Error(`Author '${args.author}' not found`)
      }

      const book = new Book({
        title: args.title,
        published: args.published,
        author: author._id,
        genres: args.genres,
      })

      return book.save()
    },

    addAuthor: async (root, args) => {
      const author = new Author({
        name: args.name,
        born: args.born,
      })

      return author.save()
    },

    editAuthor: async (root, args) => {
      const author = await Author.findOne({
        name: args.name,
      })

      if (!author) {
        return null
      }

      author.born = args.setBornTo

      return author.save()
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