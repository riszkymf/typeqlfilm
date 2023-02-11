import {readdirSync, existsSync } from "fs";
import path from "path";
import { OperationAcls,ResolverWrapper } from "../types/type";
const normalizedPath:string = path.join(__dirname,".")

type UserDefinedLambda = {
    acl: OperationAcls,
    schemas: string[],
    lambdas: ResolverWrapper
}



const getDirectories = (source:string) => 
    readdirSync(source,{ withFileTypes: true})
    .filter(directoryEntry => directoryEntry.isDirectory())
    .map(directoryEntry => directoryEntry.name)

const getLambdaMaps = async():Promise<UserDefinedLambda>=>{

    const lambdaAcls:OperationAcls = {
        Query: {},
        Mutation: {}
    }
    
    const SchemaStrList:string[] = []
    
    const lambdaMap:ResolverWrapper = {
        Query: {},
        Mutation: {}
    };

    const directories = getDirectories(normalizedPath);
    for(const folder of directories){
        const aclPath = normalizedPath + "/" + folder;
        if(existsSync(aclPath + "/acl.json")){
            const data = await import("./" + folder + "/acl.json")
            Object.assign(lambdaAcls.Query, data.Query);
            Object.assign(lambdaAcls.Mutation, data.Mutation)
        }
        if(existsSync(aclPath + "/index.js")){
            const data = await import("./" + folder + "/index.js")
            Object.assign(lambdaMap, data.default);        
        }
        if(existsSync(aclPath + "/schema.js")){
            const data = await import("./" + folder + "/schema.js")
            SchemaStrList.push(data.default)
        }
    }
    const lambdaMaps:UserDefinedLambda = {
        acl: lambdaAcls,
        schemas: SchemaStrList,
        lambdas: lambdaMap
    } 

    return lambdaMaps
}

export {
    getLambdaMaps
}