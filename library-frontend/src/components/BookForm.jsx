import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { ALL_AUTHORS, ALL_BOOKS, CREATE_BOOK } from '../queries'

const BookForm = () => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])
  const [createBook, result] = useMutation(CREATE_BOOK, {
    refetchQueries: [{ query: ALL_BOOKS }, { query: ALL_AUTHORS }],
    awaitRefetchQueries: true,
    update: (cache, { data }) => {
      const createdBook = data?.addBook
      if (!createdBook) {
        return
      }

      const booksData = cache.readQuery({ query: ALL_BOOKS })
      if (booksData) {
        cache.writeQuery({
          query: ALL_BOOKS,
          data: { allBooks: booksData.allBooks.concat(createdBook) },
        })
      }

      const authorsData = cache.readQuery({ query: ALL_AUTHORS })
      if (authorsData) {
        const existingAuthor = authorsData.allAuthors.find(
          (existing) => existing.name === createdBook.author.name,
        )
        const allAuthors = existingAuthor
          ? authorsData.allAuthors.map((existing) =>
              existing.name === createdBook.author.name
                ? { ...existing, bookCount: existing.bookCount + 1 }
                : existing,
            )
          : authorsData.allAuthors.concat(createdBook.author)

        cache.writeQuery({
          query: ALL_AUTHORS,
          data: { allAuthors },
        })
      }
    },
  })

  const addGenre = () => {
    const nextGenre = genre.trim()
    if (nextGenre && !genres.includes(nextGenre)) {
      setGenres(genres.concat(nextGenre))
    }
    setGenre('')
  }

  const submit = async (event) => {
    event.preventDefault()

    await createBook({
      variables: {
        title,
        author,
        published: Number(published),
        genres,
      },
    })

    setTitle('')
    setAuthor('')
    setPublished('')
    setGenre('')
    setGenres([])
  }

  return (
    <div>
      <h2>add book</h2>
      <form onSubmit={submit}>
        <div>
          <label>
            title
            <input
              value={title}
              onChange={({ target }) => setTitle(target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            author
            <input
              value={author}
              onChange={({ target }) => setAuthor(target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            published
            <input
              type="number"
              value={published}
              onChange={({ target }) => setPublished(target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            genre
            <input
              value={genre}
              onChange={({ target }) => setGenre(target.value)}
            />
          </label>
          <button type="button" onClick={addGenre}>
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit" disabled={result.loading}>
          {result.loading ? 'creating...' : 'create book'}
        </button>
        {result.error && <div>Error: {result.error.message}</div>}
      </form>
    </div>
  )
}

export default BookForm