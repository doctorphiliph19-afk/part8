import { useState } from 'react'
import { useQuery } from '@apollo/client/react'
import { ALL_BOOKS, ALL_BOOKS_WITH_GENRE } from '../queries'

const Books = () => {
  const [genre, setGenre] = useState(null)

  const {
    data: allBooksData,
    loading: allBooksLoading,
    error: allBooksError,
    refetch: refetchAllBooks,
  } = useQuery(ALL_BOOKS)

  const {
    data: genreBooksData,
    loading: genreBooksLoading,
    error: genreBooksError,
    refetch: refetchGenreBooks,
  } = useQuery(ALL_BOOKS_WITH_GENRE, {
    variables: {
      genre,
    },
    skip: !genre,
  })

  if (allBooksLoading || genreBooksLoading) {
    return <div>loading...</div>
  }

  if (allBooksError || genreBooksError) {
    const error = allBooksError || genreBooksError
    return <div>Error: {error.message}</div>
  }

  const allBooks = allBooksData.allBooks
  const books = genre ? genreBooksData?.allBooks || [] : allBooks

  const genres = [...new Set(allBooks.flatMap(book => book.genres))]

  const selectGenre = async selectedGenre => {
    setGenre(selectedGenre)

    // Make sure the latest books are fetched from the server
    await refetchAllBooks()

    if (selectedGenre) {
      await refetchGenreBooks({
        genre: selectedGenre,
      })
    }
  }

  const showAllGenres = async () => {
    setGenre(null)

    // Refresh all books when the user selects "all genres"
    await refetchAllBooks()
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
          <button key={g} onClick={() => selectGenre(g)}>
            {g}
          </button>
        ))}
        <button onClick={showAllGenres}>all genres</button>
      </div>
    </div>
  )
}

export default Books
