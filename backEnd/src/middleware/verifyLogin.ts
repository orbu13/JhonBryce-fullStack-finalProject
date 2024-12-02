import  {NextFunction, Request, Response} from "express"

function verifyUser(req:Request, res:Response, next:NextFunction) : any{
    if(req.headers["loggedIn"] === "false" || req.headers["role"] !== "user"){
        return res.status(401).json({message: 'Access denied. User is not login'})
    } 
next()
}

export default verifyUser