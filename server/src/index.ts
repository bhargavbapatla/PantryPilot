import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.ts';
import authRouter from './routes/authRouters.ts';
import {config} from 'dotenv';
import {connectDB, disconnectDB} from './config/db.ts';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.ts';

config();
connectDB();

// Swagger setup

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
// Swagger route
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/auth', authRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // await connectDB();
});


app.use('/user', userRouter);
