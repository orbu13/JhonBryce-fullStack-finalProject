import {NextFunction, Request, Response} from "express"

function verifyAdmin(req:Request, res:Response, next:NextFunction): any{
    if(req.headers["loggedIn"] === "false"){
        return res.status(401).json({message: 'Access denied. User is not login'})
    }else if(req.headers["role"] != "admin"){
        return res.status(401).json({message: 'Access denied. User is not admin'})
    }
    next()
}

export default verifyAdmin