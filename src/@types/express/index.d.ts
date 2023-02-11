import { TokenObject,ResponseHandlerType } from "../../types/type"

declare global{
   namespace Express {
      export interface Request {
         auth?: TokenObject
         nextRes?: ResponseHandlerType
      }
   }
} 