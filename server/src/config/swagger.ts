// server/src/config/swagger.ts
import swaggerJsdoc from 'swagger-jsdoc';
import path from 'path'; 
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const options = {
    definition: {
        openapi: '3.0.0',
        components: {
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        email: { type: 'string' },
                        name: { type: 'string' }
                    }
                }
            }
        },
        info: {
            title: 'Inventory Management API',
            version: '1.0.0',
            description: 'API for managing inventory, recipes, and orders',
        },
        servers: [
            {
                url: 'http://localhost:3000', // Make sure this matches your port
                description: 'Local server',
            },
        ],
    },
    // This looks for API documentation inside your route files
    apis: [path.join(__dirname, '../routes/*.ts')],
};

export const swaggerSpec = swaggerJsdoc(options);