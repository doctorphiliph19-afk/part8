import { useQuery } from '@apollo/client/react'
import { BOOKS_BY_GENRE, ME } from '../queries'

const Recommendations = () => {
  const userResult = useQuery(ME)
  const favoriteGenre = userResult.data?.me?.favoriteGenre
  const booksResult = useQuery(BOOKS_BY_GENRE, {
    variables: { genre: favoriteGenre },
    skip: !favoriteGenre,
  })

  if (userResult.loading || booksResult.loading) {
    return <div>loading...</div>
  }

  if (userResult.error || booksResult.error) {
    const error = userResult.error || booksResult.error
    return <div>Error: {error.message}</div>
  }

  const books = booksResult.data?.allBooks ?? []

  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{favoriteGenre}</b>
      </p>
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
    </div>
  )
}

export default Recommendations
