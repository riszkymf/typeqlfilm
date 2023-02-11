import { rule, shield, or , IRule, IRules} from "graphql-shield"
import { applyMiddleware } from "graphql-middleware"
import { GraphQLSchema } from "graphql"
import { GraphQLResolveInfo } from "graphql"

type TypePermission = {
    [permissionLevel:string]: IRule
}



/**
 * A Mapping of permission rule
 */
const permissionRule:TypePermission = {
    public: rule({cache: 'contextual'})(
        async (parent:any,args:any,context:any,info:GraphQLResolveInfo) => {
            const role = context.auth.role;
            if(role && role === 'public'){
                return true;
            }
            return false;
        }),
    user: rule({cache: 'contextual'})(
        async (parent:any,args:any,context:any,info:GraphQLResolveInfo) => {
            const role = context.auth.role;
            if(role && role === 'user'){
                return true;
            }
            return false;
        }),
    root: rule({cache: 'contextual'})(
        async (parent:any,args:any,context:any,info:GraphQLResolveInfo) => {
            const role = context.auth.role;
            if(role && role === 'root'){
                return true;
            }
            return false;
    })
}

/**
 * 
 * @param permission defined permission level (user role)
 * @returns graphql-shield RuleOr function
 */
const buildPermission = (permission:string) =>{
    switch(permission){
        case "public":
            return or(permissionRule["public"],permissionRule["user"],permissionRule["root"])
        case "user":
            return or(permissionRule["user"],permissionRule["root"])
        case "root":
            return or(permissionRule["root"])
    }
}

/**
 * 
 * @param schema GraphQL Schema
 * @param aclSchema Operation Acl maps for resolver
 * @returns Schema with acl rules
 */
const buildSchemaWithAcl = (schema:GraphQLSchema, aclSchema:IRules) =>{
    return applyMiddleware(schema, shield(aclSchema,{}))
}

export {
    buildSchemaWithAcl,
    buildPermission
}