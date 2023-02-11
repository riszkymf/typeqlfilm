const Schema = `

input CreateUserInput{
    username: String
    password: String
    role: String
}

input AuthenticateUserInput{
    username: String
    password: String
}

type AuthenticateOut{
    status: Boolean
    message: String
    data: AuthenticateUserData
}

type AuthenticateUserData{
    username: String
    role: String
    accessToken: String
}


type Mutation{
    createAccount(input:CreateUserInput):AuthenticateOut
}

type Query{
    authenticateUser(input:AuthenticateUserInput):AuthenticateOut
}`

export default Schema