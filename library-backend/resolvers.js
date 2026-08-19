// In-memory data storage
let authors = [
  {
    id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
    name: "Robert Martin",
    born: 1952,
  },
  {
    id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
    name: "Martin Fowler",
    born: 1963,
  },
  {
    id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
    name: "Fyodor Dostoevsky",
    born: 1821,
  },
  {
    id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    name: "Joshua Kerievsky",
  },
  {
    id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    name: "Sandi Metz",
  },
]

let books = [
  {
    title: "Clean Code",
    published: 2008,
    author: "Robert Martin",
    id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Agile software development",
    published: 2002,
    author: "Robert Martin",
    id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
    genres: ["agile", "patterns", "design"],
  },
  {
    title: "Refactoring, edition 2",
    published: 2018,
    author: "Martin Fowler",
    id: "afa5de00-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring"],
  },
  {
    title: "Refactoring to patterns",
    published: 2008,
    author: "Joshua Kerievsky",
    id: "afa5de01-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "patterns"],
  },
  {
    title: "Practical Object-Oriented Design, An Agile Primer Using Ruby",
    published: 2012,
    author: "Sandi Metz",
    id: "afa5de02-344d-11e9-a414-719c6709cf3e",
    genres: ["refactoring", "design"],
  },
  {
    title: "Crime and punishment",
    published: 1866,
    author: "Fyodor Dostoevsky",
    id: "afa5de03-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "crime"],
  },
  {
    title: "Demons",
    published: 1872,
    author: "Fyodor Dostoevsky",
    id: "afa5de04-344d-11e9-a414-719c6709cf3e",
    genres: ["classic", "revolution"],
  },
]

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, args) => {
      let filtered = books

      if (args.author) {
        filtered = filtered.filter(book => book.author === args.author)
      }

      if (args.genre) {
        filtered = filtered.filter(book => book.genres.includes(args.genre))
      }

      return filtered
    },
    allAuthors: () => authors,
  },
  Author: {
    bookCount: (root) =>
      books.filter(book => book.author === root.name).length,
  },
  Book: {
    author: (root) => authors.find(author => author.name === root.author),
  },
  Mutation: {
    addBook: (root, args) => {
      let author = authors.find(existingAuthor => existingAuthor.name === args.author)

      if (!author) {
        author = {
          id: `author-${Date.now()}`,
          name: args.author,
        }
        authors = authors.concat(author)
      }

      const book = {
        title: args.title,
        published: args.published,
        author: author.name,
        genres: args.genres,
        id: `book-${Date.now()}`,
      }

      books = books.concat(book)
      return book
    },
    editAuthor: (root, args) => {
      const author = authors.find(a => a.name === args.name)
      if (!author) {
        return null
      }
      author.born = args.setBornTo
      return author
    },
  },
}

module.exports = resolvers