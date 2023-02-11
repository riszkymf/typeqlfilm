import * as jwt from "jsonwebtoken"
import { AppConfig } from "../types/config"
import { EnumAclLevels, TokenObject } from "../types/type";
import * as express from 'express';


const getJWTErrors = (err:jwt.VerifyErrors):string =>{
    let message:string;
    switch(err.name){
        case 'TokenExpiredError':
            message = `BDC_TOKEN_ERROR: Your session have expired`
            break;
        case 'JsonWebTokenError':
            message = `BDC_TOKEN_ERROR: Your token is invalid`
            break;
        case 'NotBeforeError':
            message = 'BDC_TOKEN_ERROR: Your token is not active yet'
            break;
        default:
            message = 'BDC_TOKEN_ERROR: Unknown token error'
            break;
    }
    return message
}

const authMiddleware = (req:express.Request,res:express.Response,next:express.NextFunction) =>{
    const authObj:TokenObject = {
        role: EnumAclLevels.public
    }
    let jwtValue = '';

    if(req.headers.authorization){
        jwtValue = req.headers.authorization.replace("Bearer ","")
    }

    if(jwtValue && jwtValue !== ''){
        jwt.verify(jwtValue,AppConfig.JWT_SECRET,(err,decoded)=>{
            if(err){
                req.nextRes = {
                    status: 401,
                    json: {
                        status: 401,
                        message: getJWTErrors(err)
                    }
                }
            } else {
                Object.assign(authObj,decoded)
            }
        })
    } 
    req.auth = authObj
    next()
}

export {
    authMiddleware
}