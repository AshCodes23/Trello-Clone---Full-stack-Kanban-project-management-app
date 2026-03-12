import { useState, useEffect, useRef } from 'react';
import { X, AlignLeft, Tag, Clock, CheckSquare, User, Trash2, Plus, Check } from 'lucide-react';
import {
    updateCard, deleteCard,
    addChecklist, addChecklistItem, toggleChecklistItem,
    getLabels, addLabelToCard, removeLabelFromCard,
    getUsers, addMemberToCard, removeMemberFromCard
} from '../api';

const CardModal = ({ card, onClose, refreshBoard }) => {
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');
    const [isEditingDesc, setIsEditingDesc] = useState(false);
    const [newChecklistTitle, setNewChecklistTitle] = useState('');
    const [isAddingChecklist, setIsAddingChecklist] = useState(false);
    const [newItemTitles, setNewItemTitles] = useState({});

    // Popover states
    const [showLabels, setShowLabels] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showDates, setShowDates] = useState(false);

    // Data for popovers
    const [allLabels, setAllLabels] = useState([]);
    const [allUsers, setAllUsers] = useState([]);
    const [dueDate, setDueDate] = useState(card.dueDate ? card.dueDate.split('T')[0] : '');

    const labelsRef = useRef(null);
    const membersRef = useRef(null);
    const datesRef = useRef(null);

    // Current card labels and member IDs for quick lookup
    const cardLabelIds = (card.labels || []).map(l => l.label.id);
    const cardMemberIds = (card.members || []).map(m => m.user.id);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (labelsRef.current && !labelsRef.current.contains(e.target)) setShowLabels(false);
            if (membersRef.current && !membersRef.current.contains(e.target)) setShowMembers(false);
            if (datesRef.current && !datesRef.current.contains(e.target)) setShowDates(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSaveDesc = () => {
        updateCard(card.id, { description }).then(() => {
            setIsEditingDesc(false);
            refreshBoard();
        });
    };

    const handleSaveTitle = () => {
        if (title !== card.title && title.trim()) {
            updateCard(card.id, { title }).then(refreshBoard);
        }
    };

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            deleteCard(card.id).then(() => {
                onClose();
                refreshBoard();
            });
        }
    };

    const handleAddChecklist = (e) => {
        e.preventDefault();
        if (!newChecklistTitle.trim()) return;
        addChecklist({ cardId: card.id, title: newChecklistTitle }).then(() => {
            setNewChecklistTitle('');
            setIsAddingChecklist(false);
            refreshBoard();
        });
    };

    const handleAddItem = (checklistId, e) => {
        e.preventDefault();
        const itemTitle = newItemTitles[checklistId];
        if (!itemTitle || !itemTitle.trim()) return;
        addChecklistItem({ checklistId, title: itemTitle }).then(() => {
            setNewItemTitles(prev => ({ ...prev, [checklistId]: '' }));
            refreshBoard();
        });
    };

    const handleToggleItem = (itemId, isCompleted) => {
        toggleChecklistItem(itemId, { isCompleted }).then(refreshBoard);
    };

    // Labels
    const openLabels = () => {
        getLabels().then(res => setAllLabels(res.data)).catch(console.error);
        setShowLabels(true);
        setShowMembers(false);
        setShowDates(false);
    };

    const handleToggleLabel = (labelId) => {
        if (cardLabelIds.includes(labelId)) {
            removeLabelFromCard(card.id, labelId).then(refreshBoard);
        } else {
            addLabelToCard(card.id, labelId).then(refreshBoard);
        }
    };

    // Members
    const openMembers = () => {
        getUsers().then(res => setAllUsers(res.data)).catch(console.error);
        setShowMembers(true);
        setShowLabels(false);
        setShowDates(false);
    };

    const handleToggleMember = (userId) => {
        if (cardMemberIds.includes(userId)) {
            removeMemberFromCard(card.id, userId).then(refreshBoard);
        } else {
            addMemberToCard(card.id, userId).then(refreshBoard);
        }
    };

    // Dates
    const openDates = () => {
        setShowDates(true);
        setShowLabels(false);
        setShowMembers(false);
    };

    const handleSaveDate = () => {
        const dueDateValue = dueDate ? new Date(dueDate).toISOString() : null;
        updateCard(card.id, { dueDate: dueDateValue }).then(() => {
            setShowDates(false);
            refreshBoard();
        });
    };

    const handleRemoveDate = () => {
        setDueDate('');
        updateCard(card.id, { dueDate: null }).then(() => {
            setShowDates(false);
            refreshBoard();
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button
                    className="btn btn-neutral"
                    style={{ position: 'absolute', top: '16px', right: '16px', borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
                    onClick={onClose}
                >
                    <X size={16} />
                </button>

                <div style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}>
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            onBlur={handleSaveTitle}
                            style={{ fontSize: '20px', fontWeight: 600, border: 'none', backgroundColor: 'transparent', padding: '4px 8px', marginLeft: '-8px' }}
                        />
                        <div style={{ color: 'var(--ds-text-subtle)', marginLeft: '8px', fontSize: '14px' }}>
                            in list <u>{card.list?.title || 'Unknown list'}</u>
                        </div>

                        <div style={{ display: 'flex', gap: '24px', margin: '24px 0 0 8px', flexWrap: 'wrap' }}>
                            {card.members && card.members.length > 0 && (
                                <div>
                                    <div className="modal-section-label">Members</div>
                                    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                                        {card.members.map(m => (
                                            <img key={m.user.id} src={m.user.avatarUrl} alt={m.user.name} className="member-avatar" title={m.user.name} />
                                        ))}
                                        <button className="btn btn-neutral btn-icon-sm" onClick={openMembers}><Plus size={14} /></button>
                                    </div>
                                </div>
                            )}

                            {card.labels && card.labels.length > 0 && (
                                <div>
                                    <div className="modal-section-label">Labels</div>
                                    <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', alignItems: 'center' }}>
                                        {card.labels.map(l => (
                                            <div key={l.label.id} className="label-chip" style={{ backgroundColor: l.label.color }}>
                                                {l.label.title}
                                            </div>
                                        ))}
                                        <button className="btn btn-neutral btn-icon-sm" onClick={openLabels}><Plus size={14} /></button>
                                    </div>
                                </div>
                            )}

                            {card.dueDate && (
                                <div>
                                    <div className="modal-section-label">Due date</div>
                                    <div className={`due-date-badge ${new Date(card.dueDate) < new Date() ? 'overdue' : ''}`}>
                                        <Clock size={14} />
                                        {new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Description */}
                        <div style={{ marginTop: '32px' }}>
                            <div className="modal-section-header">
                                <AlignLeft size={20} />
                                <h3 style={{ margin: 0 }}>Description</h3>
                                {!isEditingDesc && description && (
                                    <button className="btn btn-neutral" style={{ marginLeft: 'auto' }} onClick={() => setIsEditingDesc(true)}>Edit</button>
                                )}
                            </div>

                            <div style={{ marginLeft: '32px' }}>
                                {isEditingDesc || !description ? (
                                    <div>
                                        <textarea
                                            value={description}
                                            onChange={e => setDescription(e.target.value)}
                                            placeholder="Add a more detailed description..."
                                            style={{ minHeight: '108px', marginBottom: '8px' }}
                                            autoFocus={isEditingDesc}
                                        />
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="btn btn-primary" onClick={handleSaveDesc}>Save</button>
                                            <button className="btn btn-neutral" onClick={() => { setIsEditingDesc(false); setDescription(card.description || ''); }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        style={{ backgroundColor: 'var(--ds-background-neutral)', padding: '12px', borderRadius: '3px', cursor: 'pointer', whiteSpace: 'pre-wrap' }}
                                        onClick={() => setIsEditingDesc(true)}
                                    >
                                        {description}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Checklists */}
                        {card.checklists && card.checklists.map(checklist => {
                            const completed = checklist.items.filter(i => i.isCompleted).length;
                            const percent = checklist.items.length === 0 ? 0 : Math.round((completed / checklist.items.length) * 100);

                            return (
                                <div key={checklist.id} style={{ marginTop: '32px' }}>
                                    <div className="modal-section-header">
                                        <CheckSquare size={20} />
                                        <h3 style={{ margin: 0 }}>{checklist.title}</h3>
                                    </div>

                                    <div style={{ marginLeft: '32px' }}>
                                        <div className="checklist-progress">
                                            <span className="checklist-percent">{percent}%</span>
                                            <div className="checklist-bar">
                                                <div className="checklist-bar-fill" style={{ width: `${percent}%`, backgroundColor: percent === 100 ? '#61bd4f' : '#0c66e4' }} />
                                            </div>
                                        </div>

                                        {checklist.items.map(item => (
                                            <div key={item.id} className="checklist-item">
                                                <input
                                                    type="checkbox"
                                                    checked={item.isCompleted}
                                                    onChange={(e) => handleToggleItem(item.id, e.target.checked)}
                                                    className="checklist-checkbox"
                                                />
                                                <span className={item.isCompleted ? 'checklist-item-done' : ''}>
                                                    {item.title}
                                                </span>
                                            </div>
                                        ))}

                                        <form onSubmit={(e) => handleAddItem(checklist.id, e)} style={{ marginTop: '12px' }}>
                                            <input
                                                type="text"
                                                value={newItemTitles[checklist.id] || ''}
                                                onChange={(e) => setNewItemTitles(prev => ({ ...prev, [checklist.id]: e.target.value }))}
                                                placeholder="Add an item"
                                            />
                                            {newItemTitles[checklist.id] && (
                                                <div style={{ marginTop: '8px' }}>
                                                    <button type="submit" className="btn btn-primary">Add</button>
                                                </div>
                                            )}
                                        </form>
                                    </div>
                                </div>
                            );
                        })}

                    </div>

                    {/* Sidebar */}
                    <div className="modal-sidebar">
                        <h4 className="sidebar-heading">Add to card</h4>
                        <div className="sidebar-actions">
                            {/* Members Popover */}
                            <div className="popover-anchor" ref={membersRef}>
                                <button className="btn btn-neutral sidebar-btn" onClick={openMembers}>
                                    <User size={16} /> Members
                                </button>
                                {showMembers && (
                                    <div className="sidebar-popover">
                                        <div className="popover-header">
                                            <span>Members</span>
                                            <button className="popover-close" onClick={() => setShowMembers(false)}><X size={14} /></button>
                                        </div>
                                        {allUsers.map(user => (
                                            <div key={user.id} className="popover-item popover-item-member" onClick={() => handleToggleMember(user.id)}>
                                                <img src={user.avatarUrl} alt={user.name} className="member-avatar-sm" />
                                                <span>{user.name}</span>
                                                {cardMemberIds.includes(user.id) && <Check size={14} className="popover-check" />}
                                            </div>
                                        ))}
                                        {allUsers.length === 0 && <div className="popover-empty">No users found</div>}
                                    </div>
                                )}
                            </div>

                            {/* Labels Popover */}
                            <div className="popover-anchor" ref={labelsRef}>
                                <button className="btn btn-neutral sidebar-btn" onClick={openLabels}>
                                    <Tag size={16} /> Labels
                                </button>
                                {showLabels && (
                                    <div className="sidebar-popover">
                                        <div className="popover-header">
                                            <span>Labels</span>
                                            <button className="popover-close" onClick={() => setShowLabels(false)}><X size={14} /></button>
                                        </div>
                                        {allLabels.map(label => (
                                            <div key={label.id} className="popover-item popover-item-label" onClick={() => handleToggleLabel(label.id)}>
                                                <div className="label-color-bar" style={{ backgroundColor: label.color }}>
                                                    {label.title}
                                                </div>
                                                {cardLabelIds.includes(label.id) && <Check size={14} className="popover-check" />}
                                            </div>
                                        ))}
                                        {allLabels.length === 0 && <div className="popover-empty">No labels found</div>}
                                    </div>
                                )}
                            </div>

                            {/* Checklist */}
                            <div className="popover-anchor">
                                <button
                                    className="btn btn-neutral sidebar-btn"
                                    onClick={() => setIsAddingChecklist(!isAddingChecklist)}
                                >
                                    <CheckSquare size={16} /> Checklist
                                </button>
                                {isAddingChecklist && (
                                    <div className="sidebar-popover">
                                        <div className="popover-header">
                                            <span>Add checklist</span>
                                            <button className="popover-close" onClick={() => setIsAddingChecklist(false)}><X size={14} /></button>
                                        </div>
                                        <form onSubmit={handleAddChecklist} style={{ padding: '8px 12px' }}>
                                            <div className="modal-section-label">Title</div>
                                            <input type="text" autoFocus value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)} />
                                            <button type="submit" className="btn btn-primary" style={{ marginTop: '8px', width: '100%' }}>Add</button>
                                        </form>
                                    </div>
                                )}
                            </div>

                            {/* Dates Popover */}
                            <div className="popover-anchor" ref={datesRef}>
                                <button className="btn btn-neutral sidebar-btn" onClick={openDates}>
                                    <Clock size={16} /> Dates
                                </button>
                                {showDates && (
                                    <div className="sidebar-popover">
                                        <div className="popover-header">
                                            <span>Due date</span>
                                            <button className="popover-close" onClick={() => setShowDates(false)}><X size={14} /></button>
                                        </div>
                                        <div style={{ padding: '8px 12px' }}>
                                            <input
                                                type="date"
                                                value={dueDate}
                                                onChange={e => setDueDate(e.target.value)}
                                                style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid var(--ds-border)', fontFamily: 'inherit', fontSize: '14px' }}
                                            />
                                            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                                                <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleSaveDate}>Save</button>
                                                <button className="btn btn-neutral" style={{ flex: 1 }} onClick={handleRemoveDate}>Remove</button>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <h4 className="sidebar-heading" style={{ marginTop: '24px' }}>Actions</h4>
                        <div className="sidebar-actions">
                            <button className="btn btn-neutral sidebar-btn" style={{ color: '#ae2e24' }} onClick={handleDelete}>
                                <Trash2 size={16} /> Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CardModal;
