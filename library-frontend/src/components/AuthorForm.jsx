import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { ALL_AUTHORS, EDIT_AUTHOR } from '../queries'

const AuthorForm = () => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')
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

  return (
    <div>
      <h2>set birth year</h2>
      <form onSubmit={submit}>
        <div>
          <label>
            name
            <input
              value={name}
              onChange={({ target }) => setName(target.value)}
              required
            />
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