# Lambda and Customized Resolver

As generated operation only serves basic CRUD operations, for a complex operation you will need lambda. For example see [user lambda](../src/lambdas/User")

Each lambda is separated on its own folder inside src/lambdas, where it must have:
    - [acl.json](../src/lambdas/User/acl.json") for acl mapping
    - [index.ts](../src/lambdas/User/index.ts") for resolver
    - [schema.ts](../src/lambdas/User/schema.ts") for schema definition

Any type defined in lambda will not be created on database and wont generate CRUD operation by itself. Its purpose is to create a resolver that interact with an already existing type in database.

### Explanation on User Lambda
In this example, we will use an already existing user lambda that works as registration and authentication for GraphQL access.

It has two resolver, createAccount and authenticateUser, the former used to salt password before it is stored on database. The later is used to authenticate user. Both will generate user information and an access token that will be need for query access.

```ts
/** Exported resolver function */
module.exports =  {
    Mutation:{
        createAccount: createAccount
    },
    Query: {
        authenticateUser: authenticateUser,
    }
}
```
**schema.ts**
schema.ts is where the GraphQL Object is defined. It can use a pre defined schema from schemaModel.ts without importing as both schema will be merged in the end.

**acl.json**
acl.json is where you create the acl control for your lambda. For further information on acl, see [acl documentation](./acl.md)

