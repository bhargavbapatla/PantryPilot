import { prisma } from "../config/db.ts";
import pkg from 'express'

const { Request, Response } = pkg;

export const createOrder = async (req: Request, res: Response) => {
    try {
        const { customer, status, orderItems, orderDate, grandTotal, items } = req.body;
        const { name, phone, address, customerId } = customer;
        let customerResp;
        if (customer.id) {
            customerResp = await prisma.customer.findUnique({
                where: {
                    id: customerId,
                },
            });
        } else {
            customerResp = await prisma.customer.create({
                data: { name, phone, address },
            });
        }

        const newOrder = await prisma.order.create({
            data: {
                customerName: name, // Snapshot Name
                grandTotal: Number(grandTotal),
                status: status || "Pending",
                orderDate: new Date(orderDate), // Ensure Date format is correct
                customer: {
                    connect: { id: customerResp.id }
                },

                orderItems: {
                    create: items.map((item: any) => ({
                        product: { connect: { id: item.productId } },
                        quantity: Number(item.quantity),
                        sellingPrice: Number(item.sellingPrice)
                    }))
                }
            },
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
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error creating order',
            status: 400,
            error: error.message,
        });
    }
}

export const getAllOrders = async (req: Request, res: Response) => {
    try {
        const orders = await prisma.order.findMany({
            include: {
                orderItems: {
                    include: { product: true }
                },
                customer: true
            }
        });
        return res.status(200).json({
            message: 'Orders fetched successfully',
            status: 200,
            data: orders,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching orders',
            status: 400,
            error: error.message,
        });
    }
}

export const getOrderById = async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.findUnique({
            where: {
                id: req.params.id,
            },
        });
        return res.status(200).json({
            message: 'Order fetched successfully',
            status: 200,
            data: order,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error fetching order',
            status: 400,
            error: error.message,
        });
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
        return res.status(200).json({
            message: 'Order updated successfully',
            status: 200,
            data: order,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error updating order',
            status: 400,
            error: error.message,
        });
    }
}

export const deleteOrder = async (req: Request, res: Response) => {
    try {
        const order = await prisma.order.delete({
            where: {
                id: req.params.id,
            },
        });
        return res.status(200).json({
            message: 'Order deleted successfully',
            status: 200,
            data: order,
        });
    } catch (error) {
        return res.status(400).json({
            message: 'Error deleting order',
            status: 400,
            error: error.message,
        });
    }
}
