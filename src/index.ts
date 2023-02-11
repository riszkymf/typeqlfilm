import { altairExpress } from 'altair-express-middleware';
import schema from "./schemas"
import express from "express"
import { graphqlHTTP } from "express-graphql";
import { InitSetup } from "./models/model";
import {authMiddleware} from "./middleware/auth"
import { exit } from "process";
import { AppConfig } from "./types/config";

InitSetup().then(()=>{
    const app = express();
    schema.buildSchemaConfig().then(config=>{
        app.use('/graphql',authMiddleware,graphqlHTTP(config))
        app.use('/graphiql', altairExpress({
            endpointURL: '/graphql'
        }));
        app.listen(AppConfig.APP_PORT)
    }).catch(err=>{
        console.log(err)
        exit(1)
    })
    
}).catch(err=>{
    console.log(err)
    exit(1)
})