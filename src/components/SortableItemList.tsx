'use client';

import { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, X, Hash, Clock, CornerUpLeft, Check } from 'lucide-react';
import { updateJobItemOrder, toggleJobItemFuture, removeJobService, removeJobPart, updateJobItem } from '@/app/actions/job';
import { toast } from 'sonner';

interface SortableItem {
    id: number;
    service_name?: string;
    part_name?: string;
    part_no?: string;
    price: number;
    quantity: number;
    sort_order: number;
    is_future: boolean | number;
}

interface Props {
    jobId: number;
    initialItems: SortableItem[];
    type: 'service' | 'part';
    isAdmin: boolean;
    isLocked: boolean;
    isFutureView?: boolean;
    editMode?: boolean;
}

export default function SortableItemList({ jobId, initialItems, type, isAdmin, isLocked, isFutureView = false, editMode = false }: Props) {
    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    async function handleReorder(newOrder: SortableItem[]) {
        setItems(newOrder);
        const updateData = newOrder.map((item, index) => ({
            id: item.id,
            sort_order: index,
        }));
        const res = await updateJobItemOrder(jobId, type, updateData);
        if (res.error) toast.error(res.error);
    }

    async function handleToggleFuture(itemId: number) {
        const res = await toggleJobItemFuture(jobId, type, itemId);
        if (res.success) {
            toast.success(isFutureView ? 'Moved back to current job' : 'Moved to Future Work');
        } else {
            toast.error(res.error || 'Failed to move item');
        }
    }

    async function handleDelete(itemId: number) {
        if (!confirm('Are you sure you want to remove this item?')) return;
        const res = type === 'service' ? await removeJobService(jobId, itemId) : await removeJobPart(jobId, itemId);
        if (res.error) toast.error(res.error);
    }

    async function handleSaveItem(itemId: number, price: number, quantity: number) {
        const res = await updateJobItem(jobId, type, itemId, price, quantity);
        if (res.success) {
            toast.success('Item updated');
            setItems(prev => prev.map(i => i.id === itemId ? { ...i, price, quantity } : i));
        } else {
            toast.error(res.error || 'Failed to update');
        }
    }

    if (items.length === 0) {
        return (
            <div style={{
                padding: '28px 20px',
                textAlign: 'center',
                borderRadius: '12px',
                border: '2px dashed var(--border)',
                marginBottom: '20px',
            }}>
                <p style={{ fontSize: '13px', color: 'var(--text-muted)', fontWeight: 500 }}>
                    No items added yet
                </p>
            </div>
        );
    }

    return (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
            {items.map((item) => (
                <ReorderItem
                    key={item.id}
                    item={item}
                    type={type}
                    isAdmin={isAdmin}
                    isLocked={isLocked}
                    isFutureView={isFutureView}
                    editMode={editMode}
                    onToggleFuture={() => handleToggleFuture(item.id)}
                    onDelete={() => handleDelete(item.id)}
                    onSave={(price: number, quantity: number) => handleSaveItem(item.id, price, quantity)}
                />
            ))}
        </Reorder.Group>
    );
}

function ReorderItem({ item, type, isAdmin, isLocked, isFutureView, editMode, onToggleFuture, onDelete, onSave }: any) {
    const controls = useDragControls();
    const name = type === 'service' ? item.service_name : item.part_name;

    const [editPrice, setEditPrice] = useState<number>(item.price);
    const [editQty, setEditQty] = useState<number>(item.quantity);
    const [saving, setSaving] = useState(false);

    // Reset local state when item updates from parent
    useEffect(() => {
        setEditPrice(item.price);
        setEditQty(item.quantity);
    }, [item.price, item.quantity]);

    async function handleSave() {
        setSaving(true);
        await onSave(editPrice, editQty);
        setSaving(false);
    }

    const isDirty = editPrice !== item.price || editQty !== item.quantity;

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            style={{ listStyle: 'none' }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: editMode ? '10px 14px' : '12px 14px',
                    marginBottom: '6px',
                    borderRadius: '12px',
                    border: `1.5px solid ${editMode ? 'rgba(59,130,246,0.35)' : 'var(--border)'}`,
                    backgroundColor: editMode ? 'rgba(59,130,246,0.04)' : 'var(--bg-main)',
                    transition: 'border-color 0.15s, box-shadow 0.15s, background 0.15s',
                    gap: '10px',
                }}
                onMouseEnter={e => {
                    if (!editMode) e.currentTarget.style.borderColor = isFutureView ? 'rgba(245,158,11,0.4)' : 'rgba(59,130,246,0.35)';
                }}
                onMouseLeave={e => {
                    if (!editMode) e.currentTarget.style.borderColor = 'var(--border)';
                }}
            >
                {/* Left: Drag handle + Name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    {/* Drag handle */}
                    {!isLocked && !editMode && (
                        <div
                            onPointerDown={(e) => controls.start(e)}
                            title="Drag to reorder"
                            style={{
                                cursor: 'grab',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px',
                                borderRadius: '6px',
                                color: 'var(--text-muted)',
                                flexShrink: 0,
                                transition: 'background 0.15s, color 0.15s',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-main)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <GripVertical size={16} />
                        </div>
                    )}

                    {/* Item info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{
                            fontSize: '13.5px', fontWeight: 700,
                            color: 'var(--text-main)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {name}
                        </div>
                        {/* Qty + Part no row */}
                        {!editMode && (
                            <div style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                marginTop: '2px',
                                fontSize: '11px', fontWeight: 600,
                                textTransform: 'uppercase', letterSpacing: '0.05em',
                                color: 'var(--text-muted)',
                            }}>
                                {type === 'part' && item.part_no && (
                                    <>
                                        <Hash size={9} />
                                        <span style={{ fontFamily: 'monospace' }}>{item.part_no}</span>
                                        <span>·</span>
                                    </>
                                )}
                                <span>Qty: {item.quantity}</span>
                            </div>
                        )}

                        {/* Edit mode — inline inputs for Qty */}
                        {editMode && isAdmin && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                                <label style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>Qty</label>
                                <input
                                    type="number"
                                    min={1}
                                    value={editQty}
                                    onChange={e => setEditQty(Math.max(1, Number(e.target.value)))}
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        width: '56px',
                                        padding: '4px 8px',
                                        borderRadius: '7px',
                                        border: '1.5px solid rgba(59,130,246,0.35)',
                                        background: 'var(--bg-card)',
                                        color: 'var(--text-main)',
                                        fontSize: '13px', fontWeight: 700,
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Right: Price / Edit inputs / Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

                    {/* Edit mode — price input + save */}
                    {editMode && isAdmin ? (
                        <>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>₹</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={editPrice}
                                    onChange={e => setEditPrice(Number(e.target.value))}
                                    onClick={e => e.stopPropagation()}
                                    style={{
                                        width: '72px',
                                        padding: '5px 8px',
                                        borderRadius: '8px',
                                        border: '1.5px solid rgba(59,130,246,0.4)',
                                        background: 'var(--bg-card)',
                                        color: '#3b82f6',
                                        fontSize: '13px', fontWeight: 800,
                                        outline: 'none',
                                        textAlign: 'right',
                                    }}
                                />
                            </div>

                            {isDirty && (
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={saving}
                                    title="Save changes"
                                    style={{
                                        width: '30px', height: '30px', borderRadius: '8px',
                                        border: '1.5px solid rgba(16,185,129,0.4)',
                                        background: 'rgba(16,185,129,0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        cursor: 'pointer', color: '#10b981',
                                        transition: 'all 0.15s', flexShrink: 0,
                                        opacity: saving ? 0.6 : 1,
                                    }}
                                >
                                    <Check size={14} strokeWidth={3} />
                                </button>
                            )}
                        </>
                    ) : (
                        /* Normal mode — static price */
                        isAdmin && (
                            <span style={{
                                fontSize: '13px', fontWeight: 800,
                                color: 'var(--text-main)',
                                minWidth: '60px', textAlign: 'right',
                            }}>
                                ₹{(item.price * item.quantity).toLocaleString()}
                            </span>
                        )
                    )}

                    {/* Future Work toggle — hidden in edit mode */}
                    {!isLocked && !editMode && (
                        isFutureView ? (
                            <button
                                type="button"
                                onClick={onToggleFuture}
                                title="Move back to current job"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 10px', borderRadius: '8px',
                                    border: '1.5px solid rgba(245,158,11,0.35)',
                                    background: 'rgba(245,158,11,0.08)',
                                    color: '#f59e0b',
                                    cursor: 'pointer',
                                    fontSize: '11px', fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(245,158,11,0.16)';
                                    e.currentTarget.style.transform = 'scale(1.04)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'rgba(245,158,11,0.08)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                <CornerUpLeft size={13} strokeWidth={2.5} />
                                <span>Restore</span>
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={onToggleFuture}
                                title="Move to Future Work (not billed)"
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '5px',
                                    padding: '5px 10px', borderRadius: '8px',
                                    border: '1.5px solid rgba(100,116,139,0.25)',
                                    background: 'transparent',
                                    color: 'var(--text-muted)',
                                    cursor: 'pointer',
                                    fontSize: '11px', fontWeight: 700,
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s',
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = 'rgba(99,102,241,0.08)';
                                    e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
                                    e.currentTarget.style.color = '#6366f1';
                                    e.currentTarget.style.transform = 'scale(1.04)';
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = 'transparent';
                                    e.currentTarget.style.borderColor = 'rgba(100,116,139,0.25)';
                                    e.currentTarget.style.color = 'var(--text-muted)';
                                    e.currentTarget.style.transform = 'scale(1)';
                                }}
                            >
                                <Clock size={13} strokeWidth={2.5} />
                                <span>Future</span>
                            </button>
                        )
                    )}

                    {/* Delete — hidden in edit mode */}
                    {!isLocked && !editMode && (
                        <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Remove item"
                            style={{
                                width: '30px', height: '30px', borderRadius: '8px',
                                border: '1.5px solid var(--border)',
                                background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: 'var(--text-muted)',
                                transition: 'all 0.15s',
                                flexShrink: 0,
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.08)';
                                e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)';
                                e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.borderColor = 'var(--border)';
                                e.currentTarget.style.color = 'var(--text-muted)';
                            }}
                        >
                            <X size={15} />
                        </button>
                    )}
                </div>
            </div>
        </Reorder.Item>
    );
}
