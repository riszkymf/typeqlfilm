export const AppConfig = {
    JWT_SECRET: process.env.JWT_SECRET ?? "myJWTSecret",
    JWT_EXPIRES: parseInt(process.env.TokenExpires ?? '864000'),
    DB_HOST: process.env.DB_HOST || "postgres://postgres:postgres@localhost:5532/movieql",
    APP_PORT: parseInt(process.env.APP_PORT ?? '4842') 
}
