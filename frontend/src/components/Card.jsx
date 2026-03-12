import { Draggable } from '@hello-pangea/dnd';
import { AlignLeft, CheckSquare, Clock } from 'lucide-react';
import { useState } from 'react';
import CardModal from './CardModal';

const Card = ({ card, index, refreshBoard }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Check if card has badges to display
    const hasDescription = !!card.description;
    const hasDueDate = !!card.dueDate;
    const hasChecklist = card.checklists && card.checklists.length > 0;

    let checklistTotal = 0;
    let checklistCompleted = 0;
    if (hasChecklist) {
        card.checklists.forEach(cl => {
            checklistTotal += cl.items.length;
            checklistCompleted += cl.items.filter(item => item.isCompleted).length;
        });
    }

    return (
        <>
            <Draggable draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                    <div
                        className={`card-item ${snapshot.isDragging ? 'is-dragging' : ''}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        onClick={() => setIsModalOpen(true)}
                    >
                        {card.labels && card.labels.length > 0 && (
                            <div className="card-labels">
                                {card.labels.map(l => (
                                    <span key={l.label.id} className="card-label" style={{ backgroundColor: l.label.color }} title={l.label.title} />
                                ))}
                            </div>
                        )}

                        <div className="card-title">{card.title}</div>

                        {(hasDescription || hasDueDate || hasChecklist || (card.members && card.members.length > 0)) && (
                            <div className="card-badges">
                                {hasDueDate && (
                                    <div className="card-badge" style={{ backgroundColor: new Date(card.dueDate) < new Date() ? '#eb5a46' : 'transparent', color: new Date(card.dueDate) < new Date() ? 'white' : 'inherit', padding: new Date(card.dueDate) < new Date() ? '2px 4px' : '0', borderRadius: '3px' }}>
                                        <Clock size={14} />
                                        <span>{new Date(card.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                    </div>
                                )}

                                {hasDescription && (
                                    <div className="card-badge">
                                        <AlignLeft size={14} />
                                    </div>
                                )}

                                {hasChecklist && checklistTotal > 0 && (
                                    <div className={`card-badge ${checklistCompleted === checklistTotal ? 'is-complete' : ''}`} style={{ backgroundColor: checklistCompleted === checklistTotal ? '#61bd4f' : 'transparent', color: checklistCompleted === checklistTotal ? 'white' : 'inherit', padding: checklistCompleted === checklistTotal ? '2px 4px' : '0', borderRadius: '3px' }}>
                                        <CheckSquare size={14} />
                                        <span>{checklistCompleted}/{checklistTotal}</span>
                                    </div>
                                )}

                                <div style={{ flexGrow: 1 }} />

                                {card.members && card.members.length > 0 && (
                                    <div className="card-members" style={{ display: 'flex', gap: '2px' }}>
                                        {card.members.map(m => (
                                            <img key={m.user.id} src={m.user.avatarUrl} alt={m.user.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} title={m.user.name} />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Draggable>

            {isModalOpen && (
                <CardModal
                    card={card}
                    onClose={() => setIsModalOpen(false)}
                    refreshBoard={refreshBoard}
                />
            )}
        </>
    );
};

export default Card;
