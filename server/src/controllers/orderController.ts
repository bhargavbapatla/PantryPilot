import { prisma } from "../config/db.ts";
import pkg from 'express'

const { Request, Response } = pkg;

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { customer, status, orderItems, orderDate, grandTotal, items } = req.body;
        console.log("customercustomer", customer);
        const {name, phone, address, customerId} = customer;
        let customerResp;
        if (customer.id) {
            customerResp = await prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
            });
        } else {
            customerResp = await prisma.customer.create({
                data: {name, phone, address},
            });
        }

        console.log("customerResp", customerResp);

        const newOrder = await prisma.order.create({
            data: {
                // --- Order Details ---
                customerName: name, // Snapshot Name
                grandTotal: Number(grandTotal),
                status: status || "Pending",
                orderDate: new Date(orderDate), // Ensure Date format is correct
                // --- Customer Relation (Connect or Create) ---
                customer: { 
                    connect: { id: customerResp.id } 
                },

                // --- Order Items (Nested Write) ---
                orderItems: {
                    create: items.map((item: any) => ({
                        // Connect to the specific Product ID
                        product: { connect: { id: item.productId } },
                        // Save the transaction details
                        quantity: Number(item.quantity),
                        sellingPrice: Number(item.sellingPrice)
                    }))
                }
            },
            // Optional: Return the created items in the response
            include: {
                orderItems: {
                    include: { product: true }
                },
                customer: true
            }
        });

        return res.status(200).json({
        message: 'Order created successfully',
        status: 200,
        data: newOrder,
    })
    } catch (error) {
        console.log("error", error);
        res.status(400).json({ error: 'Error creating order' });
    }
}

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany();
        res.status(200).json(orders);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching orders' });
    }
}

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: 'Error fetching order' });
    }
}

export const updateOrder = async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.update({
            where: {
                id: req.params.id,
            },
            data: req.body,
        });
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: 'Error updating order' });
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.delete({
            where: {
                id: req.params.id,
            },
        });
        res.status(200).json(order);
    } catch (error) {
        res.status(400).json({ error: 'Error deleting order' });
    }
}
