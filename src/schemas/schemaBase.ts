import {GraphQLEnumType,GraphQLInputObjectType,GraphQLNonNull,GraphQLString} from "graphql"

/**
 * SearchParameterOperator as a base type for generating Query Input Variables
 */
const SearchParameterOperator = new GraphQLEnumType({
    name: "SearchParameterOperator",
    values: {
        lt: {value: "lt"},
        lte: {value: "lte"},
        eq: {value: "eq"},
        gte: {value: "gte"},
        gt: {value: "gt"},
        like: {value: "like"},
        not: {value: "not"},
        isEmpty: {value: "isEmpty"},
        notEmpty: {value: "notEmpty"}
    }
})

const SortDirection = new GraphQLEnumType({
    name: "SortDirection",
    values: {
        ASC: {value: "ASC"},
        DSC: {value: "DSC"}
    }
})

const SearchParameterInput = new GraphQLInputObjectType({
    name: "SearchParameterInput",
    fields:()=>({
        operator: {
            type: new GraphQLNonNull(SearchParameterOperator)
        },
        value: {
            type: GraphQLString
        }
    })
})

export  {
    SearchParameterInput,
    SortDirection,
    SearchParameterOperator
}

