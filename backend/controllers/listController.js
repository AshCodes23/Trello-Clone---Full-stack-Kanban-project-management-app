import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createList = async (req, res) => {
    const { title, boardId, order } = req.body;
    try {
        const list = await prisma.list.create({
            data: { title, boardId, order: parseFloat(order) },
            include: { cards: true }
        });
        res.status(201).json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateList = async (req, res) => {
    const { id } = req.params;
    const { title } = req.body;
    try {
        const list = await prisma.list.update({
            where: { id },
            data: { title },
        });
        res.json(list);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteList = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.list.delete({ where: { id } });
        res.json({ message: 'List deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const reorderLists = async (req, res) => {
    // lists parameter should be an array of { id, order }
    const { lists } = req.body;
    try {
        const updates = lists.map((list) =>
            prisma.list.update({
                where: { id: list.id },
                data: { order: parseFloat(list.order) },
            })
        );
        await prisma.$transaction(updates);
        res.json({ message: 'Lists reordered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
