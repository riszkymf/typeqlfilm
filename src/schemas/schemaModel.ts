/**
 * Declare your GraphQL Object type here. For Custom mutation and  query declaration
 * use lambdas ("../../docs/lambdas.md")
 */

const Schema = `
    scalar Timestamp
    scalar Date
    type Movie{
        id: ID
        createdAt: Timestamp
        updatedAt: Timestamp
        title: String!
        actors: [ActorMovie!]
        directedBy: [AuthorMovie!]
    }

    type Actor{
        id: ID
        createdAt: Timestamp
        updatedAt: Timestamp
        firstname: String!
        lastname: String
        birthplace: String
        birthdate: Date
        isAuthor: Boolean
        authorId: ID
        works: [ActorMovie]
    }

    type ActorMovie{
        id: ID
        createdAt: Timestamp
        updatedAt: Timestamp
        actorId: ID!
        movieId: ID!
        actor: Actor
        movie: Movie
    }

    type AuthorMovie{
        id: ID
        createdAt: Timestamp
        updatedAt: Timestamp
        authorId: ID!
        movieId:  ID!
        author: Author
        movie: Movie
    }


    type Author{
        id: ID
        createdAt: Timestamp
        updatedAt: Timestamp
        firstname: String
        lastname: String
        birthplace: String
        birthdate: Timestamp
        isActor: Boolean
        actorId: ID
        works: [AuthorMovie]
    }

    type User{
        id: ID
        createdAt: Timestamp
        updatedAt: Timestamp
        role: String!
        username: String!
        password: String!
    }

`


export default {
    Schema
}

