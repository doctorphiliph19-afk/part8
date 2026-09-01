
export const BOOK_ADDED = gql`
  subscription bookAdded {
    bookAdded {
      title
      published
      author {
        name
      }
      genres
      id
    }
  }
`
import { gql } from '@apollo/client'

export const LOGIN = gql`
  mutation login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const ALL_BOOKS = gql`
  query AllBooks {
    allBooks {
      title
      author {
        name
        id
        born
        bookCount
      }
      published
      genres
      id
    }
  }
`

export const ALL_AUTHORS = gql`
  query AllAuthors {
    allAuthors {
      name
      born
      bookCount
      id
    }
  }
`

export const ME = gql`
  query Me {
    me {
      username
      favoriteGenre
      id
    }
  }
`

export const ALL_BOOKS_WITH_GENRE = gql`
  query AllBooksWithGenre($genre: String!) {
    allBooks(genre: $genre) {
      title
      published
      author {
        name
      }
      genres
      id
    }
  }
`

export const CREATE_BOOK = gql`
  mutation createBook(
    $title: String!
    $author: String!
    $published: Int!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      author: $author
      published: $published
      genres: $genres
    ) {
      title
      author {
        name
        id
        born
        bookCount
      }
      published
      genres
      id
    }
  }
`

export const EDIT_AUTHOR = gql`
  mutation editAuthor($name: String!, $setBornTo: Int!) {
    editAuthor(name: $name, setBornTo: $setBornTo) {
      name
      born
    }
  }
`