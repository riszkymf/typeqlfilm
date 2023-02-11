import { IRules } from 'graphql-shield';
import schemaModel from "./schemaModel";
import { generateOperations} from "../helpers/schemaParser";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { getAclMaps } from "../schemaAcl";
import { buildSchemaWithAcl } from "../helpers/acl";
import { buildPermission } from "../helpers/acl";
import { getLambdaMaps } from '../lambdas';
import { NewSchema } from '../types/type';
import { mergeTypeDefs } from "@graphql-tools/merge"
import { EnumAclLevels } from '../types/type';
import { Options } from "express-graphql";

/**
 * This function generate mutations, query and resolver for defined Schema in
 * schemas/schemaMode.ts and combines it with defined Lambdas on lambdas/ and acl rules
 * in schemaAcl
 * @returns Express GraphQL Configuration Options
 */
const buildSchemaConfig = async ():Promise<Options> =>{
    const newSchema:NewSchema = generateOperations(schemaModel.Schema)
    const SchemaAclMap:IRules = {
        Query: {},
        Mutation: {}
    }
    const gtAcls = await getAclMaps();
    const lambdaMaps = await getLambdaMaps();
    newSchema.resolvers.forEach(resolver => {
        Object.keys(resolver.Query).forEach(queryFields=>{
            const aclLevel:string = gtAcls.Query[queryFields] ?? EnumAclLevels.user;
            Object.assign(SchemaAclMap.Query,{
                [queryFields]: buildPermission(aclLevel)
            })
        })
        Object.keys(resolver.Mutation).forEach(mutationField=>{
            const aclLevel:string = gtAcls.Mutation[mutationField] ?? EnumAclLevels.user;
            Object.assign(SchemaAclMap.Mutation,{
                [mutationField]: buildPermission(aclLevel)
            })
        })
    });
    
    Object.keys(lambdaMaps.acl.Query).forEach(lambdaName=>{
        Object.assign(SchemaAclMap.Query,{
            [lambdaName]: buildPermission(lambdaMaps.acl.Query[lambdaName])
        })
    })
    
    Object.keys(lambdaMaps.acl.Mutation).forEach(lambdaName=>{
        Object.assign(SchemaAclMap.Mutation,{
            [lambdaName]: buildPermission(lambdaMaps.acl.Mutation[lambdaName])
        })
    })
    
    const types = [newSchema.schema].concat(lambdaMaps.schemas)
    newSchema.resolvers.push(lambdaMaps.lambdas)
    const mergedLambdas = mergeTypeDefs(types)
    const mergedSchema = makeExecutableSchema({
        typeDefs: mergedLambdas,
        resolvers: newSchema.resolvers
    })
    const secureSchema = buildSchemaWithAcl(mergedSchema,SchemaAclMap)
    const GraphQLOptions:Options = {
        schema: secureSchema,
        graphiql: true,
        rootValue: lambdaMaps.lambdas
    }
    return GraphQLOptions
    
}


export default {
    buildSchemaConfig
}