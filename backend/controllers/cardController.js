import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createCard = async (req, res) => {
    const { title, listId, order } = req.body;
    try {
        const card = await prisma.card.create({
            data: { title, listId, order: parseFloat(order) },
            include: {
                labels: { include: { label: true } },
                members: { include: { user: true } },
                checklists: { include: { items: true } }
            }
        });
        res.status(201).json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateCard = async (req, res) => {
    const { id } = req.params;
    const { title, description, dueDate } = req.body;
    try {
        const card = await prisma.card.update({
            where: { id },
            data: { title, description, dueDate },
            include: {
                labels: { include: { label: true } },
                members: { include: { user: true } },
                checklists: { include: { items: true } }
            }
        });
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteCard = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.card.delete({ where: { id } });
        res.json({ message: 'Card deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const reorderCards = async (req, res) => {
    const { cards } = req.body; // array of { id, order } for cards in SAME list
    try {
        const updates = cards.map((card) =>
            prisma.card.update({
                where: { id: card.id },
                data: { order: parseFloat(card.order) },
            })
        );
        await prisma.$transaction(updates);
        res.json({ message: 'Cards reordered' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const moveCard = async (req, res) => {
    const { cardId, newListId, newOrder } = req.body;
    try {
        const card = await prisma.card.update({
            where: { id: cardId },
            data: { listId: newListId, order: parseFloat(newOrder) },
        });
        res.json(card);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const searchCards = async (req, res) => {
    const { q, labelId, memberId, dueDate } = req.query;

    const whereClause = {
        title: { contains: q || '', mode: 'insensitive' },
    };

    if (labelId) {
        whereClause.labels = { some: { labelId } };
    }
    if (memberId) {
        whereClause.members = { some: { userId: memberId } };
    }
    if (dueDate) {
        // example filter for past due or upcoming
        // simplified: just matching exact or less than
        whereClause.dueDate = { lte: new Date(dueDate) };
    }

    try {
        const cards = await prisma.card.findMany({
            where: whereClause,
            include: {
                labels: { include: { label: true } },
                members: { include: { user: true } },
                list: { select: { title: true, boardId: true } }
            }
        });
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
