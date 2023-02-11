import { AppConfig } from '../types/config';
import * as jwt from "jsonwebtoken"
import { TokenObject } from "../types/type"


const createToken = (payload:TokenObject):string =>{
    const secretKey = AppConfig.JWT_SECRET;
    const expireTime = AppConfig.JWT_EXPIRES
    Object.assign(payload,{
        authIssuedAt: Math.floor(Date.now()/1000)
    })
    const tokenValue = jwt.sign(payload,secretKey,{
        algorithm: "HS256",
        expiresIn: expireTime
    })
    return tokenValue
}

const getCurrentTimestamp = ():number =>{
    return Math.floor(Date.now() / 1000)
}

export {
    createToken,
    getCurrentTimestamp
}