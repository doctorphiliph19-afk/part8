import { useState } from 'react'
import { useMutation } from '@apollo/client/react'
import { LOGIN } from '../queries'

const LoginForm = ({ setToken }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, result] = useMutation(LOGIN, {
    onCompleted: ({ login: data }) => {
      localStorage.setItem('library-user-token', data.value)
      setToken(data.value)
    },
  })

  const submit = (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
  }

  return (
    <form onSubmit={submit}>
      <h2>login</h2>
      <div>
        <label>
          username
          <input
            aria-label="username"
            value={username}
            onChange={({ target }) => setUsername(target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          password
          <input
            aria-label="password"
            type="password"
            value={password}
            onChange={({ target }) => setPassword(target.value)}
            required
          />
        </label>
      </div>
      <button type="submit" disabled={result.loading}>
        login
      </button>
      {result.error && <div>login failed</div>}
    </form>
  )
}

export default LoginForm