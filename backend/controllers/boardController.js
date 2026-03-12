import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getBoards = async (req, res) => {
    try {
        const boards = await prisma.board.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(boards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getBoard = async (req, res) => {
    const { id } = req.params;
    try {
        const board = await prisma.board.findUnique({
            where: { id },
            include: {
                lists: {
                    orderBy: { order: 'asc' },
                    include: {
                        cards: {
                            orderBy: { order: 'asc' },
                            include: {
                                labels: { include: { label: true } },
                                members: { include: { user: true } },
                                checklists: { include: { items: true } }
                            }
                        }
                    }
                }
            }
        });
        if (!board) return res.status(404).json({ error: 'Board not found' });
        res.json(board);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createBoard = async (req, res) => {
    const { title, background } = req.body;
    try {
        const board = await prisma.board.create({
            data: { title, background },
        });
        res.status(201).json(board);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
