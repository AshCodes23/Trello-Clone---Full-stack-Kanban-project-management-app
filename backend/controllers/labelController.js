import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getLabels = async (req, res) => {
    try {
        const labels = await prisma.label.findMany({ orderBy: { title: 'asc' } });
        res.json(labels);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addLabelToCard = async (req, res) => {
    const { id } = req.params; // cardId
    const { labelId } = req.body;
    try {
        const cardLabel = await prisma.cardLabel.create({
            data: { cardId: id, labelId },
            include: { label: true }
        });
        res.status(201).json(cardLabel);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Label already added to card' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const removeLabelFromCard = async (req, res) => {
    const { id, labelId } = req.params;
    try {
        await prisma.cardLabel.delete({
            where: { cardId_labelId: { cardId: id, labelId } }
        });
        res.json({ message: 'Label removed from card' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
