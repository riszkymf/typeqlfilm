# Using Altair Playground

## Gaining AccessToken
1. If you doesn't have an account, create on using createUser mutation.
```gql
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
```json
{
    "input":{
        "username": "user",
        "password": "pass",
      	"role": "user"
    }
}
```

This will return an accessToken
```json
{
  "data": {
    "createAccount": {
      "status": true,
      "message": "User is Created",
      "data": {
        "username": "user",
        "role": "user",
        "accessToken": "yourToken"
      }
    }
  }
}
```
You can manually set your Authorization header or using this script on post request script to store it on the environment
```js
const responseData = altair.response.body.data
if(responseData){
  const token = responseData.authenticateUser.data.accessToken
  altair.helpers.setEnvironment("accessToken",token,true)
}
```

Then you can set the header manually or use `{{accessToken}}` so it will retrieve your environment variable

[Setting Headers on Altair](https://altairgraphql.dev/docs/features/headers.html)