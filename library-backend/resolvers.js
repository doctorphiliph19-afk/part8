const Book = require("./models/book")
const Author = require("./models/author")

const resolvers = {
  Query: {
    bookCount: () => Book.collection.countDocuments(),
    authorCount: () => Author.collection.countDocuments(),
    allBooks: () => Book.find({}),
    allAuthors: () => Author.find({}),
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
    editAuthor: () => null,
  },
}

module.exports = resolvers