import jwt from 'jsonwebtoken';
import pkg from 'express';
const { verify } = pkg;
const { Request, Response, NextFunction } = pkg

export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
        console.log("decoded data", decoded);
        // req.body.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
}