import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import depthLimit from 'graphql-depth-limit'

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const typeDefs = `#graphql
  # Comments in GraphQL strings (such as this one) start with the hash (#) symbol.

  # This "Book" type defines the queryable fields for every book in our data source.
  type Book {
		id: String
   	    title: String
    	author: Author
  }

	type Author {
		id: String
		name: String
		books: [Book]
	}

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "books" query returns an array of zero or more Books (defined above).
  type Query {
    	books: [Book]
		authors: [Author]
		getBookById(id: String): Book
	  	getAuthorById(id: String): Author
  }

	type Mutation {
		addBook(id: String, title: String, authorId: String): Book
	}
`;

const books = [
	{
		id: 'book1',
		title: 'The Awakening',
		authorId: 'author1',
	},
	{
		id: 'book2',
		title: 'City of Glass',
		authorId: 'author2',
	},
	{
		id: 'book3',
		title: 'Twilight',
		authorId: 'author3'
	},
	{
		id: 'book4',
		title: 'Peppa pig',
		authorId: 'author1',
	},
	{
		id: 'book5',
		title: 'Matilda',
		authorId: 'author2',
	},
	{
		id: 'book6',
		title: 'Charlie and chocolate factory',
		authorId: 'author3'
	}
];

const authors = [
	{
		id: 'author1',
		name: 'Kate Chopin',
	},
	{
		id: 'author2',
		name: 'Paul Auster',
	},
	{
		id: 'author3',
		name: 'Stephanie Meyer',
	}
];

// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.
const resolvers = {
	Query: {
		books: () => books,
		getBookById: (_, { id }) => books.find(book => id === book.id),
		getAuthorById: (_,{id}) => authors.find(author => id===author.id)
	},
	Mutation:{
		addBook: (_, {id, title, authorId}) => {
			const newBook = {id, title, authorId}
			books.push(newBook);
			return newBook;
		}
	},
	Book : {
		author: ({authorId})=> {
			return authors.find(a=>a.id===authorId);
		}
	},
	Author: {
		books: ({id}) =>{
			return books.filter(book => book.authorId===id);
		}
	}
};

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({
	typeDefs,
	resolvers,
	validationRules: [depthLimit(10)],
});

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
const { url } = await startStandaloneServer(server, {
	listen: { port: 4000 },
});

console.log(`🚀 Server ready at: ${url}`);