const Book = require("./models/book")
const Author = require("./models/author")

const resolvers = {
  Query: {
    bookCount: async () => Book.countDocuments({}),
    authorCount: async () => Author.countDocuments({}),
    allBooks: async (root, args) => {
      if (args.author) {
        const author = await Author.findOne({ name: args.author })
        if (!author) {
          return []
        }
        return await Book.find({ author: author._id })
      }

      if (args.genre) {
        return await Book.find({ genres: args.genre })
      }

      return await Book.find({})
    },
    allAuthors: async () => await Author.find({}),
  },
  Mutation: {
    addBook: async (root, args) => {
      const author = await Author.findOne({ name: args.author })

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
      const author = await Author.findOne({ name: args.name })
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return author.save()
    },
  },
  Book: {
    author: async root => await Author.findById(root.author),
  },
  Author: {
    bookCount: async root => Book.countDocuments({ author: root._id }),
  },
}

module.exports = resolvers