import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({ orderBy: { name: 'asc' } });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addMemberToCard = async (req, res) => {
    const { id } = req.params; // cardId
    const { userId } = req.body;
    try {
        const cardMember = await prisma.cardMember.create({
            data: { cardId: id, userId },
            include: { user: true }
        });
        res.status(201).json(cardMember);
    } catch (error) {
        if (error.code === 'P2002') {
            return res.status(409).json({ error: 'Member already assigned to card' });
        }
        res.status(500).json({ error: error.message });
    }
};

export const removeMemberFromCard = async (req, res) => {
    const { id, userId } = req.params;
    try {
        await prisma.cardMember.delete({
            where: { cardId_userId: { cardId: id, userId } }
        });
        res.json({ message: 'Member removed from card' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
