import { readdirSync, existsSync } from "fs";
import path from "path";
import { OperationAcls } from "../types/type";

const normalizedPath:string = path.join(__dirname,".")


/**
 * 
 * @param source Path to schemaAcl directory
 * @returns Directory list
 */
const getDirectories = (source:string):string[] => 
    readdirSync(source,{ withFileTypes: true})
    .filter(directoryEntry => directoryEntry.isDirectory())
    .map(directoryEntry => directoryEntry.name)


/**
 * Generate acl configuration for graphql-shield
 * @returns Acl configuration for generated operations
 */
const getAclMaps = async():Promise<OperationAcls>=>{

    const GtAcls:OperationAcls = {
        Query: {},
        Mutation: {}
    }

    const directories = getDirectories(normalizedPath);
    for(const folder of directories){
        const aclPath = normalizedPath + "/" + folder;
        if(existsSync(aclPath + "/acl.json")){
            const data = await import("./" + folder + "/acl.json")
            Object.assign(GtAcls.Query, data.Query);
            Object.assign(GtAcls.Mutation, data.Mutation)
        }    
    }

    return GtAcls
}    

export {
    getAclMaps
}