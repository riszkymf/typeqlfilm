import { Request } from 'express';
import { createToken } from "../../lib/utils";
import { DbModel } from "../../models/model";
import * as bcrypt from "bcrypt"
import { TokenObject,EnumAclLevels } from "../../types/type";


const User = DbModel["User"];

type AuthenticateUserData = {
    username: string
    role: string
    accessToken: string
}
type UserReturn = {
    status: boolean
    message: string
    data: AuthenticateUserData|null
}

type UserRegisterInput = {
    username: string
    password: string
    role: string
}

type UserLoginInput = {
    username: string
    password: string
}

type RequestInputPayload = {
    input: UserLoginInput|UserRegisterInput
}

const authenticateUser = async (parent:unknown,args:RequestInputPayload, context:Request):Promise<UserReturn> => {
    const Result:UserReturn = {
        status: true,
        message: "Log In Success",
        data: null
    }
    const inputValue = args.input as UserLoginInput
    const jwtToken:TokenObject = {
        username: inputValue.username,
        role: "public",
        id: ""
    }
    const userData:AuthenticateUserData = {
        username: inputValue.username,
        role: "public",
        accessToken: ""
    }

    try {
        const user = await User.findOne({
            where:{
                username: inputValue.username
            }
        })
        if(!user){
            throw new Error("Username not found")
        }
        const password = user.getDataValue("password")
        const passCheck = bcrypt.compareSync(inputValue.password,password)
        if(!passCheck){
            throw new Error("Wrong Password")
        }
        jwtToken.id = user.getDataValue("id")
        jwtToken.role = user.getDataValue("role")
        const tokenStr = createToken(jwtToken)
        userData.accessToken = tokenStr
        Result.data = userData
    } catch (error) {
        Result.status = false;
        Result.message = "Error during account login : " + error
    }
    
    return Result
}

const createAccount = async (parent:unknown, args:RequestInputPayload, context:Request):Promise<UserReturn> => {
    
    const Result:UserReturn = {
        status: true,
        message: "User is Created",
        data: null
    }
    const inputValue = args.input as UserRegisterInput
    const accountRole = inputValue.role || EnumAclLevels.user
    const jwtToken:TokenObject = {
        username: inputValue.username,
        role: accountRole,
        id: ""
    }
    const userData:AuthenticateUserData = {
        username: inputValue.username,
        role: accountRole,
        accessToken: ""
    }

    try {
        const saltedPass = bcrypt.hashSync(inputValue.password,10)
        const newUser = await User.create({
            username: inputValue.username,
            password: saltedPass,
            role: accountRole
        })
        jwtToken.id = newUser.getDataValue("id")
        const tokenStr = createToken(jwtToken)
        userData.accessToken = tokenStr
        Result.data = userData
    } catch (error) {
        Result.status = false;
        Result.message = "Error during account register : " + error
    }
    
    return Result
}

module.exports =  {
    Mutation:{
        createAccount: createAccount
    },
    Query: {
        authenticateUser: authenticateUser,
    }
}