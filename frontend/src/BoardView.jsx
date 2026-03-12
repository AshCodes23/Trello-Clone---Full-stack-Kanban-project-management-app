import { useState, useEffect } from 'react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { getBoard, reorderLists, reorderCards, moveCard, createList } from './api';
import List from './components/List';
import { Plus, Filter, X, Check } from 'lucide-react';

function BoardView({
    boardId, searchQuery,
    filterLabels, filterMembers, filterDue,
    openFilter, showFilter, filterRef,
    allLabels, allUsers,
    toggleFilterLabel, toggleFilterMember, setFilterDue,
    clearFilters, hasActiveFilters
}) {
    const [board, setBoard] = useState(null);
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');

    const fetchBoard = () => {
        getBoard(boardId).then(res => {
            setBoard(res.data);
        }).catch(console.error);
    };

    useEffect(() => {
        fetchBoard();
    }, [boardId]);

    const onDragEnd = async (result) => {
        const { destination, source, draggableId, type } = result;
        if (!destination) return;
        if (destination.droppableId === source.droppableId && destination.index === source.index) return;

        if (type === 'list') {
            const newLists = Array.from(board.lists);
            const [removed] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, removed);

            const orderedLists = newLists.map((list, index) => ({ ...list, order: (index + 1) * 1000 }));
            setBoard({ ...board, lists: orderedLists });

            reorderLists(orderedLists.map(l => ({ id: l.id, order: l.order })));
            return;
        }

        if (type === 'card') {
            const sourceList = board.lists.find(l => l.id === source.droppableId);
            const destList = board.lists.find(l => l.id === destination.droppableId);

            if (source.droppableId === destination.droppableId) {
                const newCards = Array.from(sourceList.cards);
                const [removed] = newCards.splice(source.index, 1);
                newCards.splice(destination.index, 0, removed);

                const orderedCards = newCards.map((c, idx) => ({ ...c, order: (idx + 1) * 1000 }));
                const updatedLists = board.lists.map(l => l.id === sourceList.id ? { ...l, cards: orderedCards } : l);
                setBoard({ ...board, lists: updatedLists });

                reorderCards(orderedCards.map(c => ({ id: c.id, order: c.order })));
            } else {
                const sourceCards = Array.from(sourceList.cards);
                const destCards = Array.from(destList.cards);
                const [removed] = sourceCards.splice(source.index, 1);
                destCards.splice(destination.index, 0, removed);

                const prevOrder = destination.index > 0 ? destCards[destination.index - 1].order : 0;
                const nextOrder = destination.index < destCards.length - 1 ? destCards[destination.index + 1].order : prevOrder + 2000;
                const newOrder = (prevOrder + nextOrder) / 2;

                removed.order = newOrder;

                const updatedLists = board.lists.map(l => {
                    if (l.id === sourceList.id) return { ...l, cards: sourceCards };
                    if (l.id === destList.id) return { ...l, cards: destCards };
                    return l;
                });
                setBoard({ ...board, lists: updatedLists });

                moveCard({ cardId: removed.id, newListId: destList.id, newOrder }).then(fetchBoard);
            }
        }
    };

    const handleAddList = (e) => {
        e.preventDefault();
        if (!newListTitle.trim()) return;
        const newOrder = board.lists.length > 0 ? board.lists[board.lists.length - 1].order + 1000 : 1000;
        createList({ title: newListTitle, boardId, order: newOrder }).then(() => {
            setNewListTitle('');
            setIsAddingList(false);
            fetchBoard();
        });
    };

    if (!board) return null;

    // Filter + search logic
    const filteredLists = board.lists.map(list => {
        let cards = list.cards;

        if (searchQuery) {
            const lowerQuery = searchQuery.toLowerCase();
            cards = cards.filter(c =>
                c.title.toLowerCase().includes(lowerQuery) ||
                (c.description && c.description.toLowerCase().includes(lowerQuery))
            );
        }

        if (filterLabels && filterLabels.length > 0) {
            cards = cards.filter(c =>
                c.labels && c.labels.some(l => filterLabels.includes(l.label.id))
            );
        }

        if (filterMembers && filterMembers.length > 0) {
            cards = cards.filter(c =>
                c.members && c.members.some(m => filterMembers.includes(m.user.id))
            );
        }

        if (filterDue === 'overdue') {
            cards = cards.filter(c => c.dueDate && new Date(c.dueDate) < new Date());
        } else if (filterDue === 'upcoming') {
            const now = new Date();
            const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            cards = cards.filter(c => c.dueDate && new Date(c.dueDate) >= now && new Date(c.dueDate) <= nextWeek);
        } else if (filterDue === 'no-date') {
            cards = cards.filter(c => !c.dueDate);
        }

        return { ...list, cards };
    });

    return (
        <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <div className="board-header">
                <div className="board-title">{board.title}</div>
                <div style={{ flexGrow: 1 }} />
                <div className="filter-wrapper" ref={filterRef}>
                    <button
                        className={`btn ${hasActiveFilters ? 'btn-primary' : 'btn-neutral'}`}
                        onClick={openFilter}
                        style={{ gap: '6px' }}
                    >
                        <Filter size={16} />
                        Filter
                        {hasActiveFilters && <span className="filter-badge">●</span>}
                    </button>

                    {showFilter && (
                        <div className="filter-panel">
                            <div className="popover-header">
                                <span>Filter</span>
                                <button className="popover-close" onClick={openFilter}><X size={14} /></button>
                            </div>

                            {hasActiveFilters && (
                                <div style={{ padding: '0 12px 8px' }}>
                                    <button className="btn btn-neutral" style={{ width: '100%', fontSize: '12px' }} onClick={clearFilters}>
                                        Clear all filters
                                    </button>
                                </div>
                            )}

                            {/* Labels filter */}
                            <div className="filter-section">
                                <div className="filter-section-title">Labels</div>
                                {allLabels.map(label => (
                                    <div key={label.id} className="popover-item popover-item-label" onClick={() => toggleFilterLabel(label.id)}>
                                        <div className="label-color-bar" style={{ backgroundColor: label.color }}>
                                            {label.title}
                                        </div>
                                        {filterLabels.includes(label.id) && <Check size={14} className="popover-check" />}
                                    </div>
                                ))}
                            </div>

                            {/* Members filter */}
                            <div className="filter-section">
                                <div className="filter-section-title">Members</div>
                                {allUsers.map(user => (
                                    <div key={user.id} className="popover-item popover-item-member" onClick={() => toggleFilterMember(user.id)}>
                                        <img src={user.avatarUrl} alt={user.name} className="member-avatar-sm" />
                                        <span>{user.name}</span>
                                        {filterMembers.includes(user.id) && <Check size={14} className="popover-check" />}
                                    </div>
                                ))}
                            </div>

                            {/* Due date filter */}
                            <div className="filter-section">
                                <div className="filter-section-title">Due date</div>
                                {['overdue', 'upcoming', 'no-date'].map(opt => (
                                    <div key={opt} className={`popover-item ${filterDue === opt ? 'popover-item-active' : ''}`} onClick={() => setFilterDue(filterDue === opt ? '' : opt)}>
                                        <span>{opt === 'overdue' ? 'Overdue' : opt === 'upcoming' ? 'Next 7 days' : 'No due date'}</span>
                                        {filterDue === opt && <Check size={14} className="popover-check" />}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="board-canvas">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="board" type="list" direction="horizontal">
                        {(provided) => (
                            <div
                                className="board-lists"
                                {...provided.droppableProps}
                                ref={provided.innerRef}
                            >
                                {filteredLists.map((list, index) => (
                                    <List key={list.id} list={list} index={index} boardId={boardId} refreshBoard={fetchBoard} />
                                ))}
                                {provided.placeholder}

                                <div className="add-list-wrapper">
                                    {isAddingList ? (
                                        <div style={{ backgroundColor: '#f1f2f4', padding: '8px', borderRadius: '12px' }}>
                                            <form onSubmit={handleAddList}>
                                                <input
                                                    type="text"
                                                    autoFocus
                                                    value={newListTitle}
                                                    onChange={(e) => setNewListTitle(e.target.value)}
                                                    placeholder="Enter list title..."
                                                    style={{ marginBottom: '8px' }}
                                                />
                                                <div style={{ display: 'flex', gap: '8px' }}>
                                                    <button type="submit" className="btn btn-primary">Add list</button>
                                                    <button type="button" className="btn btn-neutral" onClick={() => setIsAddingList(false)}>Cancel</button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <div className="add-list-btn" onClick={() => setIsAddingList(true)}>
                                            <Plus size={16} /> Add another list
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </div>
    );
}

export default BoardView;
