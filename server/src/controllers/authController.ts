import { prisma } from "../config/db.ts";
import pkg from 'express';
import bcrypt from 'bcrypt'
import { generateToken } from "../utils/authhelper.ts";
const { Request, Response } = pkg;

const register = async (req: Request, res: Response) => {
    const {name, email, password} = req.body;

    const userExists = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if(userExists){
        return res.status(400).json({
            message: 'User already exists with this email',
        })
    }
    const saltRounds = 10;
  
  // 2. HASH IT
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
        user,
    })
}

const login = async (req: Request, res: Response) => {
    const {email, password} = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email,
        }
    })

    if(!user){
        return res.status(400).json({
            message: 'User not found with this email',
        })
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if(!passwordMatch){
        return res.status(400).json({
            message: 'Invalid email or password',
        })
    }

    const token = generateToken(user.id);

    return res.status(200).json({
        message: 'User logged in successfully',
        token,
        data: {
            userId: user.id,
            name: user.name,
            email: user.email,
        },
    })
}
export {register, login}
