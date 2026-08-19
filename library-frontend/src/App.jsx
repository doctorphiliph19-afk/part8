import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'

const App = () => {
  const [page, setPage] = useState('authors')

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
      </div>

      {page === 'authors' && <Authors />}
      {page === 'books' && <Books />}
    </div>
  )
}

export default App
