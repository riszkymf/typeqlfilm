import { GraphQLResolveInfo } from "graphql"
import { GraphQLEnumType } from 'graphql';
import  { 
GraphQLInputObjectType, 
GraphQLList,
GraphQLScalarType } from 'graphql';


enum EnumAclLevels {
    public = 'public',
    user = 'user',
    root = 'root'
}


type TokenObject = {
    username?: string
    id?: string
    role: string,
    authIssuedAt?: number
}

type ResolverFunction = (obj:unknown, args:any, context:any, info:GraphQLResolveInfo) => Promise<any>

type LambdaMapping = {
    [lambdaName:string]: ResolverFunction
}

type OperationAcls = {
    Query:{
        [operationName:string]: EnumAclLevels
    },
    Mutation:{
        [operationName:string]: EnumAclLevels
    }
}

type OperationInputType = {
    type:   GraphQLInputObjectType|
            GraphQLList<GraphQLInputObjectType>|
            GraphQLScalarType|
            GraphQLList<GraphQLScalarType>|
            GraphQLEnumType
}

type NewSchema = {
    schema: string,
    resolvers: ResolverWrapper[]
}

type ResolverWrapper = {
    Query: ResolverMap
    Mutation: ResolverMap
}

type ResolverMap = {
    [operationName:string] : ResolverFunction
}

type ResponseHandlerType = {
    status: number,
    json: {
        status: number
        message: string
    }
}



export {
    TokenObject,
    LambdaMapping,
    OperationAcls,
    ResolverWrapper,
    ResolverMap,
    NewSchema,
    OperationInputType,
    EnumAclLevels,
    ResponseHandlerType
}