import express from 'express';
import cors from 'cors';
import userRouter from './routes/user.js';
import authRouter from './routes/authRouters.js';
import dashboardRouter from './routes/dashboardRoutes.js';
import inventoryRouter from './routes/inventoryRoutes.js';
import productRouter from './routes/productRoutes.js';
import {config} from 'dotenv';
import {connectDB, disconnectDB} from './config/db.js';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import orderRouter from './routes/orderRoutes.js';
import customerRouter from './routes/customerRouters.js';
import aiRouter from './routes/aiRoutes.js';
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
app.use('/inventory', inventoryRouter);
app.use('/dashboard', dashboardRouter);
app.use('/orders', orderRouter);
app.use('/products', productRouter);
app.use('/customers', customerRouter);
app.use('/ai', aiRouter);

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.listen(PORT, async () => {
    console.log(`Server is running on port ${PORT}`);
    // await connectDB();
});


app.use('/user', userRouter);
