import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, BOOKS_BY_GENRE } from '../queries'

const Books = () => {
  const [genre, setGenre] = useState(null)

  const allBooksResult = useQuery(ALL_BOOKS)

  const booksResult = useQuery(BOOKS_BY_GENRE, {
    variables: {
      genre,
    },
  })

  if (allBooksResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }

  if (allBooksResult.error || booksResult.error) {
    const error = allBooksResult.error || booksResult.error
    return <div>Error: {error.message}</div>
  }

  const allBooks = allBooksResult.data.allBooks
  const books = booksResult.data.allBooks

  const genres = [...new Set(allBooks.flatMap(book => book.genres))]

  return (
    <div>
      <h2>books</h2>
      {genre && <h3>in genre {genre}</h3>}
      <table>
        <thead>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
        </thead>
        <tbody>
          {books.map(book => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setGenre(g)}
          >
            {g}
          </button>
        ))}
        <button onClick={() => setGenre(null)}>
          all genres
        </button>
      </div>
    </div>
  )
}

export default Books
