import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ALL_BOOKS_WITH_GENRE } from '../queries'

const Books = () => {
  const [genre, setGenre] = useState(null)
  const allBooksResult = useQuery(ALL_BOOKS)
  const genreBooksResult = useQuery(ALL_BOOKS_WITH_GENRE, {
    variables: { genre },
    skip: !genre,
    fetchPolicy: 'network-only',
  })

  if (allBooksResult.loading || genreBooksResult.loading) {
    return <div>loading...</div>
  }

  if (allBooksResult.error) {
    return <div>Error: {allBooksResult.error.message}</div>
  }

  if (genreBooksResult.error) {
    return <div>Error: {genreBooksResult.error.message}</div>
  }

  const allBooks = allBooksResult.data.allBooks
  const books = genre ? genreBooksResult.data.allBooks : allBooks
  const genres = [...new Set(allBooks.flatMap((book) => book.genres))]

  const selectGenre = async (selectedGenre) => {
    await allBooksResult.refetch()
    setGenre(selectedGenre)
  }

  const showAllGenres = async () => {
    await allBooksResult.refetch()
    setGenre(null)
  }

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
          {books.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author.name}</td>
              <td>{book.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        {genres.map((availableGenre) => (
          <button
            key={availableGenre}
            onClick={() => selectGenre(availableGenre)}
          >
            {availableGenre}
          </button>
        ))}
        <button onClick={showAllGenres}>all genres</button>
      </div>
    </div>
  )
}

export default Books
