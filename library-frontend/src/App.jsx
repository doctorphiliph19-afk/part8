import { useState } from 'react'
import { useApolloClient } from '@apollo/client/react'
import Authors from './components/Authors'
import Books from './components/Books'
import BookForm from './components/BookForm'
import AuthorForm from './components/AuthorForm'
import LoginForm from './components/LoginForm'
import Recommendations from './components/Recommendations'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(() =>
    localStorage.getItem('library-user-token'),
  )
  const client = useApolloClient()

  const logout = () => {
    localStorage.removeItem('library-user-token')
    setToken(null)
    setPage('authors')
    client.resetStore()
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && (
          <button onClick={() => setPage('recommendations')}>
            recommend
          </button>
        )}
        {token ? (
          <button onClick={logout}>logout</button>
        ) : (
          <button onClick={() => setPage('login')}>login</button>
        )}
      </div>

      {page === 'authors' && <Authors />}
      {page === 'authors' && token && <AuthorForm />}
      {page === 'books' && <Books />}
      {page === 'add' && token && <BookForm />}
      {page === 'recommendations' && token && <Recommendations />}
      {page === 'login' && !token && (
        <LoginForm setToken={setToken} setPage={setPage} />
      )}
    </div>
  )
}

export default App
