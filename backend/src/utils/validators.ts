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
            return next();
        }
        
        return res.status(422).json({ errors: errors.array() });
    };
};

export const loginValidator = [
    body("email")
        .trim()
        .isEmail()
        .withMessage("Please enter a valid email")
        .normalizeEmail(),
    
    body("password")
        .trim()
        .isLength({ min: 8 })
        .withMessage("Password must be at least 8 characters")
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/, "i")
        .withMessage("Password must include uppercase, lowercase, numbers, and special characters")
];

export const signUpValidator = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Name is required")
        .isLength({ min: 2, max: 50 })
        .withMessage("Name must be between 2 and 50 characters")
        .escape(),
    
    ...loginValidator
];

export const chatCompletionValidator = [
    body("message")
        .trim()
        .notEmpty()
        .withMessage("Message is required")
        .isLength({ min: 1, max: 1000 })
        .withMessage("Message must be between 1 and 1000 characters")
        .escape()
];