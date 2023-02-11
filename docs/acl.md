# ACL and Auth Middleware

Acl and Auth middleware is powered by [graphql-shield](https://github.com/dimatill/graphql-shield). This will protect operations according to user wishes.

Auth Middleware works by verifying user Authorization on request headers. If user doesn't have access token, their role will be set as public.

### Role Levels:
By default, this boilerplate have 3 role levels:
   1. root (highest access)
   2. user (regular access)
   3. public (lowest access)

User with high authority can access anything that their lower authority user can.
It means that if you set an operation acl role to "user" level. A request with "root" level also can access it. 

### Defining ACL:
Operation acl is defined by creating acl.json file inside on of two location. For generated operations, you can use schemaAcl/{TypeName}/acl.json. For lambda, it is the same folder where your lambda resolver is, lambdas/{lambdaName}/acl.json.

**Example**
This acl.json below will set getMovie query acl to root and deleteMovie to public.
If generated operation is not defined, its acl level will be set to user.
Note that for lambda, all operation must be explicitly defined.
```json
/** Content of schemaAcl/Movie/acl.json */
{
    "Query":{
        "getMovie": "root"
    },
    "Mutation":{
        "deleteMovie": "public"
    }
}
```
