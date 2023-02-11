
import { Op, ModelStatic, Model}  from "sequelize";
import {DbModel} from "../models/model"
import { GraphQLResolveInfo } from "graphql";

type ResolverFunction = (obj:unknown, args:any, context:any, info:GraphQLResolveInfo) => Promise<Model[]|Model|string|string[]|null>

type ModelQuery = {
    [operator:string]: unknown
}

type SearchQuery = {
    search?: ModelSearchInput
    searchAny?: ModelSearchInput
    sortDirection?: string
    sortField?: string
    limit?: number
    offset?: number
}

type ModelSearchInput = {
    [fieldName:string]: SearchParameterInput[]
}

type SearchParameterInput = {
    operator: string,
    value?: string
}

type InputPayload = {
    [fieldName:string]: string|null|number
}

class ResolverBuilder {
    
    public name: string;
    public model: string;
    public resolverTypeName: string;
    private SequelizeEntity: ModelStatic<Model>
    
    /**
     * 
     * @param name Operation Name. Generated on parser
     * @param baseModelName Sequelize Model name that correspond to defined Operation
     * @param resolverTypename Resolver type: See getResolver function for available operation
     */
    constructor(name:string, baseModelName:string, resolverTypename:string) {
        this.name = name;
        this.model = baseModelName;
        this.resolverTypeName = resolverTypename;
        this.SequelizeEntity = DbModel[baseModelName]
    }
    
    /**
     * 
     * @returns ResolverFunction for Schema Operation
     */
    getResolver():ResolverFunction{
        let errMessage:string;
        let result:ResolverFunction;
        switch (this.resolverTypeName){
            case "get":
                result = this.getById
                break;
            case "insert":
                result = this.insert
                break;
            case "insertMultiple":
                result = this.insertMultiple
                break;
            case "getFilteredList":
                result = this.getFilteredList
                break;
            case "delete":
                result = this.delete
                break;
            case "deleteMultiple":
                result = this.deleteMultiple
                break;
            case "edit":
                result = this.edit;
                break;
            case "editMultiple":
                result = this.editMultiple
                break;
            default:
            errMessage = `Resolver for operationType ${this.resolverTypeName} does not exist`
            throw(Error(errMessage))
        }
        return result
    }
    
    
    getById = async (obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<Model|null> => {
        const result = await this.SequelizeEntity.findByPk(args.id)
        return result
    }
    
    getFilteredList = async (obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<Model[]|null> => {
        const searchContext:SearchQuery = args
        const parsedSearchFilter = this._buildModelQuery(searchContext)
        const sortDir:string = (searchContext.sortDirection)?searchContext.sortDirection:'DESC';
        const sortField:string = (searchContext.sortField)?searchContext.sortField:'updatedAt';

        const result = await this.SequelizeEntity.findAll({
            where: parsedSearchFilter,
            order: [[sortField,sortDir]]
        })
        return result
    }
    
    insert = async (obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<Model|null> => {
        const result = await this.SequelizeEntity.create(args.input)
        return result
    }
    
    insertMultiple = async(obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<Model[]|null>=>{
        const result = await this.SequelizeEntity.bulkCreate(args.input)
        return result
    }

    delete = async(obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<string|null>=>{
        const dataTarget = await this.SequelizeEntity.findByPk(args.id)
        if(dataTarget){
            await dataTarget.destroy()
        }
        return args.id
    }

    deleteMultiple = async(obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<string[]|null>=>{
        const dataTargets = await this.SequelizeEntity.findAll({
            where: {
                id: args.ids
            }
        })

        for(const data of dataTargets){
            await data.destroy()
        }

        return args.ids
    }

    edit = async(obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<Model|null>=>{
        const qFilter = { id: args.input.id }
        const updateData = Object.assign({},args.input)
        delete updateData.id
        await this.SequelizeEntity.update(updateData,{
            returning: true,
            where: qFilter
        })
        const updatedData = this.SequelizeEntity.findByPk(qFilter.id)
        return updatedData
    }

    editMultiple = async(obj:unknown, args:any, context:any, info:GraphQLResolveInfo):Promise<Model[]|null>=>{
        const qFilters = { id: args.input.map((el:any)=>{
            return el.id
        }) }

        const updateInput:InputPayload[] = (args.input)?? []
        for(const updatePayload of updateInput){
            await this.SequelizeEntity.update(updatePayload,{
                where:{
                    id: updatePayload.id
                }
            })
        }

        const updatedData = this.SequelizeEntity.findAll({
            where: qFilters
        })

        return updatedData
    }
    

    /**
     * 
     * @param searchQuery Operation input variables
     * @returns Serialize model Query
     */
    _buildModelQuery = (searchQuery:SearchQuery) => {
        const resultQuery:ModelQuery = {};
        if(searchQuery.search){
            const andQuery:ModelQuery[] = [];
            const search = searchQuery.search ?? []
            Object.keys(search).forEach((field)=>{
                const fieldFilter = this._parseSearchParameterInput(field,search[field])
                andQuery.push(...fieldFilter)
            })        
            Object.assign(resultQuery,{
                [Op.and] : andQuery
            })
        }
        if(searchQuery.searchAny){
            const orQuery:ModelQuery[] = [];
            const searchAny = searchQuery.searchAny ?? []
            Object.keys(searchAny).forEach((field)=>{
                const fieldFilter = this._parseSearchParameterInput(field,searchAny[field])
                orQuery.push(...fieldFilter)
            })
            Object.assign(resultQuery,{
                [Op.or] : orQuery
            })
        }
        return resultQuery
    }

    _parseSearchParameterInput = (fieldName:string,fieldFilter:SearchParameterInput[]):ModelQuery[] =>{
        const parsedFilter:ModelQuery[] = [];
        fieldFilter.forEach(_filter=>{
            const searchOperator = this._getSearchOperator(_filter.operator,_filter.value??null)
            parsedFilter.push({
                [fieldName]: searchOperator
            })
        })
        return parsedFilter
    }

    /**
     * 
     * @param operator operator fields value from SearchParameterOperator
     * @param value value fields value from SearchParameterOperator
     * @returns Query for sequelize Model
     */
    _getSearchOperator = (operator:string,value:string|null):ModelQuery =>{
        let operation:symbol
        let isValid = true;
        switch(operator){
            case "eq":
                operation = Op.eq
                isValid = (value)?true:false;
                break;
            case "lt":
                operation = Op.lt
                isValid = (value)?true:false;
                break;
            case "lte":
                operation = Op.lte
                isValid = (value)?true:false;
                break;
            case "gt":
                operation = Op.gt
                isValid = (value)?true:false;
                break;
            case "gte":
                operation = Op.gte
                isValid = (value)?true:false;
                break;
            case "like":
                operation = Op.like
                isValid = (value)?true:false;
                break;
            case "not":
                operation = Op.ne
                isValid = (value)?true:false;
                break;
            case "isEmpty":
                operation = Op.eq
                break;
            case "notEmpty":
                operation = Op.ne
                break
            default:
                throw Error(`SearchParameterOperator ${operator} does not exists`)
        }
        if(!isValid){
            throw Error(`SearchParameterOperator ${operator} requires a value`)
        }
        const result:ModelQuery = {
            [operation]: value
        }
        return result
    }

}



export {
    ResolverBuilder,
    ResolverFunction
}