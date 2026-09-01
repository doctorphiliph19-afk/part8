import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ApolloClient, InMemoryCache, HttpLink, split } from '@apollo/client'
import { SetContextLink } from '@apollo/client/link/context'
import { ApolloProvider } from '@apollo/client/react'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'
import App from './App.jsx'

const authLink = new SetContextLink(({ headers }) => {
  const token = localStorage.getItem('library-user-token')

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : null,
    },
  }
})

const httpLink = new HttpLink({
  uri: 'http://localhost:4000',
})

const wsLink = new GraphQLWsLink(
  createClient({
    url: 'ws://localhost:4000',
    connectionParams: {
      authorization: localStorage.getItem('library-user-token') ? `Bearer ${localStorage.getItem('library-user-token')}` : null,
    },
  })
)

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query)
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    )
  },
  wsLink,
  authLink.concat(httpLink)
)

const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: splitLink,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </StrictMode>
)