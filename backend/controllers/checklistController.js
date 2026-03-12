import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const addChecklist = async (req, res) => {
    const { cardId, title } = req.body;
    try {
        const checklist = await prisma.checklist.create({
            data: { cardId, title }
        });
        res.status(201).json(checklist);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addChecklistItem = async (req, res) => {
    const { checklistId, title } = req.body;
    try {
        const item = await prisma.checklistItem.create({
            data: { checklistId, title }
        });
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleChecklistItem = async (req, res) => {
    const { id } = req.params;
    const { isCompleted } = req.body;
    try {
        const item = await prisma.checklistItem.update({
            where: { id },
            data: { isCompleted }
        });
        res.json(item);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
