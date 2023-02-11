# typeqlfilm
TypeQLFilm is a GraphQL Resolver Boilerplate that generate GraphQL Queries and Mutiation for User defined GraphQL Typeobject. It means that user does not need to explicitly create a GraphQL Resolver.

**Custom Resolver and Lambdas**
This doesn't means that this boilerplate restrict you to only use our generated operations. You still can define your own resolver and GraphQL Schema, without actually creating a table on the database (unless if you want to).

**Security**
This boilerplate also provides a acl mapping for each operations using json file. This means that user can choose authorization and restriction for certain operations.

## Running App
To run this boilerplate locally, create an env file and export it
```
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES=86400
DB_HOST=YOUR_DB_HOST
APP_PORT=YOUR_APP_PORT
```

and then run for development environment
```sh
npm run build
npm run dev
```

Or run the docker-compose file using
```
docker-compose up
```


## Usage
  To gain access for all operations, first you need to create a user using this mutation.
  ```graphql
    mutation createUser($input:CreateUserInput){
    createAccount(input:$input){
        status
        message
        data{
            username
            role
            accessToken
            }
        }
    }
  ```
  variables:
  ```json
    {
        "input":{
            "username": "yourusername",
            "password": "yourpassword",
            "role": "user"
        }
    }
  ```

  This will return an access token with user role for you to use on using this boilerplate.
  If you need to login, use `authenticateUser` query

  ```graphql
    query authenticateUser($input:AuthenticateUserInput){
    authenticateUser(input:$input){
        status
        message
        data{
            username
            role
            accessToken
        }
    }
}
  ```
Use the accesstoken as your Bearer token Authorization



## In Depth Development Notes
- [Creating new graphql object](./docs/graphql_object.md)
- [Creating custom resolver](./docs/lambda.md)
- [Setting access control level for operations](./docs/acl.md)
- [Using Example Model](./docs/using_example_model.md)
- [Using Altair](./docs/using_altair.md)