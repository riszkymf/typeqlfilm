import { GraphQLEnumType } from 'graphql';
import  { 
    GraphQLObjectType, 
    GraphQLInputObjectType, 
    GraphQLOutputType, 
    GraphQLSchema, 
    GraphQLList,
    GraphQLScalarType,
    GraphQLID,
    printSchema, 
    GraphQLInt,
    buildSchema } from 'graphql';
import {
    SortDirection,
    SearchParameterInput
 } from "../schemas/schemaBase"
import gql from 'graphql-tag';
import { ResolverBuilder,ResolverFunction } from './resolverBuiler';
import {
    OperationInputType,
    ResolverMap,
    NewSchema 
}from "../types/type"

enum OperationType {
    GetFilteredList = 'getFilteredList',
    Get = 'get',
    Insert = 'insert',
    InsertMultiple = 'insertMultiple',
    Edit = 'edit',
    EditMultiple = 'editMultiple',
    Delete = 'delete',
    DeleteMultiple = 'deleteMultiple'
}

type OperationConfig = {
    name: string
    type: GraphQLObjectType|
          GraphQLList<GraphQLObjectType>|
          GraphQLList<GraphQLScalarType>|
          GraphQLScalarType
    args: {
        [input:string]: OperationInputType
    },
    operationType: OperationType,
    baseModel: string
}

type OperationsConfig = {
    [name:string]: OperationConfig
}

type OperationSchemaConfig = {
    name: "Query"|"Mutation",
    fields: OperationsConfig
}

/**
 * This function create generic operations for defined Schema, merge it with lambdas and 
 * add acl mapping
 * @param schema Schema String Value
 * @returns Modified schema
 */
const generateOperations = (schema:string):NewSchema => {
    const inst = gql(schema).definitions.filter(el=>{
        return el.kind == "ObjectTypeDefinition"
    })
    const gqlSchema = buildSchema(schema)
    const mutationConfig:OperationSchemaConfig = {
        name: "Mutation",
        fields: {}
    };
    const queryConfig:OperationSchemaConfig = {
        name: "Query",
        fields: {}
    }

    const queryResolverMap:ResolverMap = {}
    const mutationResolverMap:ResolverMap = {}

    for(const el of inst){
        if('name' in el){
            const typeObj = el.name?.value
            const theType = gqlSchema.getType(typeObj as string)
            if(theType instanceof GraphQLObjectType){
                const mutations = createMutations(theType);
                const queries = createQueries(theType);
                Object.assign(mutationConfig.fields,mutations)
                Object.assign(queryConfig.fields,queries)
            }
        }
    }

    Object.keys(mutationConfig.fields).forEach((mutationName)=>{
        const muationOperationConfig = mutationConfig.fields[mutationName]
        const resolver = generateResolver(muationOperationConfig)
        Object.assign(mutationResolverMap,{
            [mutationName]: resolver
        })  
    })

    Object.keys(queryConfig.fields).forEach((queryName)=>{
        const queryOperationConfig = queryConfig.fields[queryName]
        const resolver = generateResolver(queryOperationConfig)
        Object.assign(queryResolverMap,{
            [queryName]: resolver
        })  
    })

    const mutationObj = new GraphQLObjectType(mutationConfig)
    const queryObj = new GraphQLObjectType(queryConfig)
    const newSchema = new GraphQLSchema({
        mutation: mutationObj,
        query: queryObj
    });

    const schemaPrinted = printSchema(newSchema)
    const result:NewSchema = {
        schema: schemaPrinted,
        resolvers: [{
            Query: queryResolverMap,
            Mutation: mutationResolverMap,
        }]
    }
    return result
}

/**
 * Create an input type from a GraphQL Object Type
 * @param gqlObject Object Type
 * @returns Input Object from object
 */
const createInputType = (gqlObject:GraphQLObjectType):GraphQLInputObjectType =>{
    const inputObjectName = gqlObject.name + "Input";
    const fields = gqlObject.getFields()
    const inputFields = {
        name: inputObjectName,
        fields: {}
    }
    Object.values(fields).forEach(el=>{
        if(isObject(el.type)){
            Object.assign(inputFields.fields,{
                [el.name]: {
                    type: el.type
                }
            })
        }
    })

    return new GraphQLInputObjectType(inputFields)
}

const createEditMultipleMutation = (gqlObject:GraphQLObjectType,inputObject:GraphQLInputObjectType):OperationConfig =>{
    const inputObjectName = "editMultiple" + gqlObject.name;
    const mutation:OperationConfig = {
        name: inputObjectName,
        type: new GraphQLList(gqlObject),
        operationType: OperationType.EditMultiple,
        args: {
            input: {
                type: new GraphQLList(inputObject)
            }
        },
        baseModel: gqlObject.name
    }

    return mutation
}

const createEditMutation = (gqlObject:GraphQLObjectType,inputObject:GraphQLInputObjectType):OperationConfig =>{
    const inputObjectName = "edit" + gqlObject.name;
    const mutation:OperationConfig = {
        name: inputObjectName,
        operationType: OperationType.Edit,
        type: gqlObject,
        args: {
            input: { type : inputObject }
        },
        baseModel: gqlObject.name
    }

    return mutation
}

const createInsertMultipleMutation = (gqlObject:GraphQLObjectType,inputObject:GraphQLInputObjectType):OperationConfig =>{
    const inputObjectName = "insertMultiple" + gqlObject.name;
    const mutation:OperationConfig = {
        name: inputObjectName,
        operationType: OperationType.InsertMultiple,
        type: new GraphQLList(gqlObject),
        args: {
            input: {type: new GraphQLList(inputObject)}
        },
        baseModel: gqlObject.name
    }

    return mutation
}

const createInsertMutation = (gqlObject:GraphQLObjectType,inputObject:GraphQLInputObjectType):OperationConfig =>{
    const inputObjectName = "insert" + gqlObject.name;
    const mutation:OperationConfig = {
        name: inputObjectName,
        operationType: OperationType.Insert,
        type: gqlObject,
        args: {
            input: { type: inputObject }
        },
        baseModel: gqlObject.name
    }

    return mutation
}



const createDeleteMutation = (gqlObject:GraphQLObjectType):OperationConfig =>{
    const inputObjectName = "delete" + gqlObject.name;
    const mutation:OperationConfig = {
        name: inputObjectName,
        operationType: OperationType.Delete,
        type: GraphQLID,
        args: {
            id: {type: GraphQLID}
        },
        baseModel: gqlObject.name
    }

    return mutation
}

const createDeleteMultipleMutation = (gqlObject:GraphQLObjectType):OperationConfig =>{
    const inputObjectName = "deleteMultiple" + gqlObject.name;
    const mutation:OperationConfig = {
        name: inputObjectName,
        operationType: OperationType.DeleteMultiple,
        type: new GraphQLList(GraphQLID),
        args: {
            input: {type: new GraphQLList(GraphQLID)}
        },
        baseModel: gqlObject.name
    }

    return mutation
}

const createMutations = (gqlObject:GraphQLObjectType):OperationsConfig =>{
    const inputObject = createInputType(gqlObject);
    const mutations:OperationsConfig = {};
    const mutationList:OperationConfig[] = [];
    mutationList.push(
        createInsertMutation(gqlObject,inputObject),
        createInsertMultipleMutation(gqlObject,inputObject),
        createEditMutation(gqlObject,inputObject),
        createEditMultipleMutation(gqlObject,inputObject),
        createDeleteMutation(gqlObject),
        createDeleteMultipleMutation(gqlObject)
        );
    
    mutationList.forEach(mutation=>{
        Object.assign(mutations,{
            [mutation.name]: mutation
        })
    
    })
    return mutations
}


const createQueryGet = (gqlObject:GraphQLObjectType):OperationConfig =>{
    const inputObjectName = "get" + gqlObject.name;
    const query:OperationConfig = {
        name: inputObjectName,
        operationType: OperationType.Get,
        type: gqlObject,
        args: {
            id: {
                type: GraphQLID
            }
        },
        baseModel: gqlObject.name
    }

    return query
}


const createQueryFilteredList = (
    gqlObject:GraphQLObjectType, 
    searchInputObject:GraphQLInputObjectType,
    sortFieldInputObject:GraphQLEnumType):OperationConfig =>{
    const inputObjectName = "get" + gqlObject.name + "FilteredList";
    const query:OperationConfig = {
        name: inputObjectName,
        type: new GraphQLList(gqlObject),
        operationType: OperationType.GetFilteredList,
        args: {
            search: {
                type: searchInputObject
            },
            searchAny: {
                type: searchInputObject
            },
            limit: {
                type: GraphQLInt
            },
            offset:{
                type: GraphQLInt
            },
            sortDirection:{
                type: SortDirection
            },
            sortField:{
                type: sortFieldInputObject
            }

        },
        baseModel: gqlObject.name
    }
    return query
}

const createSortFieldInput = (gqlObject:GraphQLObjectType):GraphQLEnumType =>{
    const inputObjectName = gqlObject.name + "SortField";
    const fields = gqlObject.getFields()
    const enumFields = {
        name: inputObjectName,
        values: {

        }
    }
    Object.values(fields).forEach(el=>{
        if(isObject(el.type)){
            Object.assign(enumFields.values,{
                [el.name]: {
                    value: el.name
                }
            })
        }
    })

    return new GraphQLEnumType(enumFields)
}

const createSearchInputType = (gqlObject:GraphQLObjectType):GraphQLInputObjectType =>{
    const inputObjectName = gqlObject.name + "SearchInput";
    const fields = gqlObject.getFields()
    const inputFields = {
        name: inputObjectName,
        fields: {}
    }
    Object.values(fields).forEach(el=>{
        if(isObject(el.type)){
            Object.assign(inputFields.fields,{
                [el.name]: {
                    type: new GraphQLList(SearchParameterInput)
                }
            })
        }
    })

    return new GraphQLInputObjectType(inputFields)
}

const isObject = (type:GraphQLOutputType):boolean => {
    if("ofType" in type){
        return isObject(type.ofType)
    } else {
        return !(type instanceof GraphQLObjectType)
    }
} 


const createQueries = (gqlObject:GraphQLObjectType):OperationsConfig =>{
    const searchInputType = createSearchInputType(gqlObject);
    const sortField = createSortFieldInput(gqlObject);
    const queries:OperationConfig[] = []
    const queryConfig:OperationsConfig = {}

    queries.push(
        createQueryFilteredList(gqlObject,searchInputType,sortField),
        createQueryGet(gqlObject)
    )
    
    queries.forEach(query=>{
        Object.assign(queryConfig,{
            [query.name] : query
        })
    })
    return queryConfig
}

const generateResolver = (operation:OperationConfig):ResolverFunction=>{

    const resolver = new ResolverBuilder(
        operation.name,
        operation.baseModel,
        operation.operationType
        )
    return resolver.getResolver()
    
}


export {
    generateOperations
}