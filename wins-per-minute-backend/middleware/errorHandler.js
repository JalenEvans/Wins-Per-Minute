import { validationResult } from "express-validator";

export function validateRequest(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array().map(error => ({
                field: error.param,
                message: error.msg
            }))
        })
    }
    next();
}

export function errorHandler(err, req, res, next) {
    console.error(err.stack); // TODO: Enhance to log this into a file
    
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
}