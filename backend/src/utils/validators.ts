import { NextFunction, Request, Response } from "express";
import { body, ValidationChain, validationResult } from "express-validator";

export const validate = (validations: ValidationChain[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (!result.isEmpty()) {
                break;
            }
        }
        const errors = validationResult(req);
        if (errors.isEmpty()) {
            next();
            return;
        }
        return res.status(422).json({ errors: errors.array() });
    }
};

export const loginValidator = [
    body("email").trim().isEmail().withMessage("email is required"),
    body("password").trim().isLength({ min: 6} ).withMessage("password should contain at least 6 characters"),
]

export const signUpValidator = [
    body("name").notEmpty().withMessage("name is required"),
    ...loginValidator
]