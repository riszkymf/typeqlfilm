import { Sequelize, DataTypes,Model,ModelStatic }  from "sequelize";
import { EnumAclLevels } from "../types/type";
import { AppConfig } from "../types/config";

const sequelize = new Sequelize(AppConfig.DB_HOST);


/**
 * File for database modeling.
 * Todo: Create a class to parse from GraphQL Schema (Better yet, SDL) to automatically create models
 * 
 */

type ModelHandler = {
    [name:string]: ModelStatic<Model>
}

class Actor extends Model{
    relation:ModelHandler = {
        "works": ActorMovie
    }
}

Actor.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: { type: DataTypes.STRING },
    birthplace: { type: DataTypes.STRING },
    birthdate: {type: DataTypes.DATEONLY},
    isAuthor: {type: DataTypes.BOOLEAN},
    authorId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
    },
    works:{
        type: DataTypes.VIRTUAL,
        get(){
           return this.relation['works'].findAll({
            where:{
                actorId: this.getDataValue('id')
            }
           })
        }
    }

},{
    sequelize,
    freezeTableName: true,
    modelName: "Actor"
})



class Movie extends Model{
    relation:ModelHandler = {
        "actors": ActorMovie,
        "directedBy": AuthorMovie
    }
}

Movie.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    actors:{
        type: DataTypes.VIRTUAL,
        get(){
            return this.relation['actors'].findAll({
                where:{
                    movieId: this.getDataValue('id')
                }
            })    
        }
    },
    directedBy:{
        type: DataTypes.VIRTUAL,
        get(){
            return this.relation['directedBy'].findAll({
                where:{
                    movieId: this.getDataValue('id')
                }
            })    
        }
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "Movie"
})


class Author extends Model{
    relation:ModelHandler = {
        "works": AuthorMovie
    }
}

Author.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastname: { type: DataTypes.STRING },
    birthplace: { type: DataTypes.STRING },
    birthdate: {
        type: DataTypes.DATEONLY
    },
    isActor: {type: DataTypes.BOOLEAN},
    actorId: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
    },
    works: {
        type: DataTypes.VIRTUAL(),
        async get(){
            const result = await this.relation['works'].findAll({
                where:{
                    authorId: this.getDataValue('id')
                }
            })
            return result
        }
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "Author"
})


class ActorMovie extends Model{
    relation:ModelHandler = {
        actor: Actor,
        movie: Movie
    }
}

ActorMovie.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    actorId: {
        type: DataTypes.UUID,
    },
    movieId: {
        type: DataTypes.UUID,
    },
    actor:{
        type: DataTypes.VIRTUAL,
        get(){
            return this.relation.actor.findOne({
                where:{
                    id: this.getDataValue('actorId')
                }
            })
        }
    },
    movie:{
        type: DataTypes.VIRTUAL,
        get(){
            return this.relation.movie.findOne({
                where:{
                    id: this.getDataValue('movieId')
                }
            })
        }
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "ActorMovie"
})

class AuthorMovie extends Model{
    relation:ModelHandler = {
        "author": Author,
        "movie": Movie
    }
}

AuthorMovie.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    authorId: {
        type: DataTypes.UUID,
    },
    movieId: {
        type: DataTypes.UUID,
    },
    author:{
        type: DataTypes.VIRTUAL,
        get(){
            return this.relation["author"].findOne({
                where:{
                    id: this.getDataValue('authorId')
                }
            })
        }
    },
    movie:{
        type: DataTypes.VIRTUAL,
        get(){
            const result = this.relation["movie"].findOne({
                where:{
                    id: this.getDataValue('movieId')
                }
            })
            return result
        }
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "AuthorMovie"
})


/**
 * Setting Up Database Models
 * @returns Void
 */
const InitSetup = async ():Promise<void> =>{
    try {
        await sequelize.sync({alter: true})
        return Promise.resolve()
    } catch (error) {
        return Promise.reject(error)
    }
}

class User extends Model{}

User.init({
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4(),
        allowNull: false,
        primaryKey: true,
        unique: true
    },
    createdAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    updatedAt: {
        type: 'TIMESTAMP',
        allowNull: false,
        defaultValue: sequelize.literal('CURRENT_TIMESTAMP'),
    },
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,

    },
    role:{
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: EnumAclLevels.user
    }
},{
    sequelize,
    freezeTableName: true,
    modelName: "User"
})

const DbModel:ModelHandler= {
    "Author": Author,
    "Movie": Movie,
    "Actor": Actor,
    "AuthorMovie": AuthorMovie,
    "ActorMovie": ActorMovie,
    "User": User
}    


export {
    DbModel,
    InitSetup
};