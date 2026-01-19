import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.ts';
import {config} from 'dotenv';
import {connectDB, disconnectDB} from './config/db.ts';

config();
connectDB();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // await connectDB();
});


app.use('/user', userRouter);
