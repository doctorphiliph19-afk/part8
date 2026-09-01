import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS } from '../queries'

const Books = () => {
  const [genre, setGenre] = useState(null)

  const result = useQuery(ALL_BOOKS)

  if (result.loading) {
    return <div>loading...</div>
  }

  if (result.error) {
    return <div>Error: {result.error.message}</div>
  }

  const books = result.data.allBooks

  const booksToShow = genre
    ? books.filter(book => book.genres.includes(genre))
    : books

  const genres = [...new Set(books.flatMap(book => book.genres))]

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
          {booksToShow.map(book => (
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
