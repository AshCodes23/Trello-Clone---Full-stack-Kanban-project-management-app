import { useState, useRef, useEffect } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { MoreHorizontal, Plus, Pencil, Trash2, X } from 'lucide-react';
import Card from './Card';
import { createCard, updateList, deleteList } from '../api';

const List = ({ list, index, boardId, refreshBoard }) => {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editTitle, setEditTitle] = useState(list.title);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAddCard = (e) => {
        e.preventDefault();
        if (!newCardTitle.trim()) return;
        const newOrder = list.cards.length > 0 ? list.cards[list.cards.length - 1].order + 1000 : 1000;

        createCard({ title: newCardTitle, listId: list.id, order: newOrder }).then(() => {
            setNewCardTitle('');
            setIsAddingCard(false);
            refreshBoard();
        });
    };

    const handleEditTitle = () => {
        setIsEditingTitle(true);
        setEditTitle(list.title);
        setShowMenu(false);
    };

    const handleSaveTitle = () => {
        if (editTitle.trim() && editTitle !== list.title) {
            updateList(list.id, { title: editTitle.trim() }).then(refreshBoard);
        }
        setIsEditingTitle(false);
    };

    const handleDeleteList = () => {
        if (window.confirm(`Delete "${list.title}" and all its cards?`)) {
            deleteList(list.id).then(refreshBoard);
        }
        setShowMenu(false);
    };

    return (
        <Draggable draggableId={list.id} index={index}>
            {(provided, snapshot) => (
                <div
                    className="list-wrapper"
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                >
                    <div className={`list-content ${snapshot.isDragging ? 'is-dragging' : ''}`}>
                        <div className="list-header" {...provided.dragHandleProps}>
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={editTitle}
                                    onChange={(e) => setEditTitle(e.target.value)}
                                    onBlur={handleSaveTitle}
                                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveTitle(); if (e.key === 'Escape') setIsEditingTitle(false); }}
                                    autoFocus
                                    className="list-title-input"
                                />
                            ) : (
                                <h2 className="list-title" onDoubleClick={handleEditTitle}>{list.title}</h2>
                            )}
                            <div className="list-menu-wrapper" ref={menuRef}>
                                <button className="btn btn-neutral" style={{ padding: '4px', height: '32px', width: '32px' }} onClick={() => setShowMenu(!showMenu)}>
                                    <MoreHorizontal size={16} />
                                </button>
                                {showMenu && (
                                    <div className="list-menu-popover">
                                        <div className="popover-header">
                                            <span>List actions</span>
                                            <button className="popover-close" onClick={() => setShowMenu(false)}><X size={14} /></button>
                                        </div>
                                        <div className="popover-item" onClick={handleEditTitle}>
                                            <Pencil size={14} /> Edit title
                                        </div>
                                        <div className="popover-divider" />
                                        <div className="popover-item popover-item-danger" onClick={handleDeleteList}>
                                            <Trash2 size={14} /> Delete list
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <Droppable droppableId={list.id} type="card">
                            {(provided, snapshot) => (
                                <div
                                    className="list-cards"
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    style={{ minHeight: snapshot.isDraggingOver ? '40px' : '2px' }}
                                >
                                    {list.cards.map((card, idx) => (
                                        <Card key={card.id} card={card} index={idx} refreshBoard={refreshBoard} />
                                    ))}
                                    {provided.placeholder}

                                    {isAddingCard && (
                                        <div style={{ marginBottom: '8px' }}>
                                            <form onSubmit={handleAddCard}>
                                                <textarea
                                                    autoFocus
                                                    value={newCardTitle}
                                                    onChange={(e) => setNewCardTitle(e.target.value)}
                                                    placeholder="Enter a title for this card..."
                                                    style={{ marginBottom: '8px', minHeight: '60px', resize: 'none' }}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && !e.shiftKey) {
                                                            e.preventDefault();
                                                            handleAddCard(e);
                                                        }
                                                    }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="submit" className="btn btn-primary">Add card</button>
                                                    <button type="button" className="btn btn-neutral" onClick={() => setIsAddingCard(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    )}
                                </div>
                            )}
                        </Droppable>

                        {!isAddingCard && (
                            <div className="list-footer">
                                <div className="add-card-btn" onClick={() => setIsAddingCard(true)}>
                                    <Plus size={16} /> Add a card
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default List;
