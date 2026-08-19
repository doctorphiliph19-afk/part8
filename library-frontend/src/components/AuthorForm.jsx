import { useState } from 'react'
import { useMutation, useQuery } from '@apollo/client/react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const AuthorForm = () => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
  const authorsResult = useQuery(ALL_AUTHORS)
  const [editAuthor, result] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    awaitRefetchQueries: true,
  })

  const submit = async (event) => {
    event.preventDefault()

    await editAuthor({
      variables: {
        name,
        setBornTo: Number(born),
      },
    })

    setName('')
    setBorn('')
  }

  if (authorsResult.loading) {
    return <div>loading...</div>
  }

  if (authorsResult.error) {
    return <div>Error: {authorsResult.error.message}</div>
  }

  const authors = authorsResult.data?.allAuthors ?? []

  return (
    <div>
      <h2>set birth year</h2>
      <form onSubmit={submit}>
        <div>
          <label>
            name
            <select
              value={name}
              onChange={({ target }) => setName(target.value)}
              required
            >
              <option value="">select author</option>
              {authors.map((author) => (
                <option key={author.name} value={author.name}>
                  {author.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div>
          <label>
            born
            <input
              type="number"
              value={born}
              onChange={({ target }) => setBorn(target.value)}
              required
            />
          </label>
        </div>
        <button type="submit" disabled={result.loading}>
          {result.loading ? 'updating...' : 'update author'}
        </button>
        {result.error && <div>Error: {result.error.message}</div>}
      </form>
    </div>
  )
}

export default AuthorForm