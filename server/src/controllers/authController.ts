import { prisma } from "../config/db.ts";
import pkg from 'express';
import bcrypt from 'bcrypt'
import { generateToken } from "../utils/authhelper.ts";
import { OAuth2Client } from 'google-auth-library';
const { Request, Response } = pkg;

const register = async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    const userExists = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if (userExists) {
        return res.status(400).json({
            message: 'User already exists with this email',
            status: 400,
        })
    }
    const saltRounds = 10;

    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const user = await prisma.user.create({
        data: {
            name,
            email,
            password: hashedPassword,
        }
    })

    return res.status(200).json({
        message: 'User registered successfully',
        status: 200,
        user,
    })
}

const login = async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const errorMessage = 'Invalid email or password';
    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if (!user) {
        return res.status(400).json({
            message: errorMessage,
            status: 400,
        })
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(400).json({
            message: errorMessage,
            status: 400,
        })
    }

    const token = generateToken(user.id);

    return res.status(200).json({
        message: 'User logged in successfully',
        status: 200,
        data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            token
        },
    })
}

const googleSSOLogin = async (req: Request, res: Response) => {
    const { googleToken } = req.body;
    const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
        idToken: googleToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
            return res.status(400).json({ message: 'Invalid Google Token', status: 400 });
        }
    const { email, name, sub: googleId, picture } = payload;
    let user = await prisma.user.findUnique({
        where: {
            email,
        }
    })
    if (!user) {
        user = await prisma.user.create({
            data: {
                name,
                email,
                password:"",

                // isGoogleUser: true,
                // picture,
            }
        })
    }
    const token = generateToken(user.id);
    return res.status(200).json({
        message: 'User logged in successfully',
        status: 200,
        data: {
            userId: user.id,
            name: user.name,
            email: user.email,
            token
        },
    })
}
export { register, login, googleSSOLogin }
