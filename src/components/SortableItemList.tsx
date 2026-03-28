'use client';

import { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { GripVertical, X, Hash } from 'lucide-react';
import { updateJobItemOrder, toggleJobItemFuture, removeJobService, removeJobPart } from '@/app/actions/job';
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
}

export default function SortableItemList({ jobId, initialItems, type, isAdmin, isLocked, isFutureView = false }: Props) {
    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        setItems(initialItems);
    }, [initialItems]);

    async function handleReorder(newOrder: SortableItem[]) {
        setItems(newOrder);
        const updateData = newOrder.map((item, index) => ({
            id: item.id,
            sort_order: index
        }));
        const res = await updateJobItemOrder(jobId, type, updateData);
        if (res.error) toast.error(res.error);
    }

    async function handleToggleFuture(itemId: number) {
        const res = await toggleJobItemFuture(jobId, type, itemId);
        if (res.success) {
            toast.success(isFutureView ? 'Moved to current job' : 'Moved to future work');
        } else {
            toast.error(res.error || 'Failed to move item');
        }
    }

    async function handleDelete(itemId: number) {
        if (!confirm('Are you sure you want to remove this item?')) return;
        const res = type === 'service' ? await removeJobService(jobId, itemId) : await removeJobPart(jobId, itemId);
        if (res.error) toast.error(res.error);
    }

    if (items.length === 0) {
        return (
            <div className="py-8 text-center border-b border-dashed border-slate-200 mb-8">
                <p className="text-sm text-slate-400 font-medium">No items added yet</p>
            </div>
        );
    }

    return (
        <Reorder.Group axis="y" values={items} onReorder={handleReorder} className="space-y-3 mb-6">
            {items.map((item) => (
                <ReorderItem 
                    key={item.id} 
                    item={item} 
                    type={type} 
                    isAdmin={isAdmin} 
                    isLocked={isLocked}
                    onToggleFuture={() => handleToggleFuture(item.id)}
                    onDelete={() => handleDelete(item.id)}
                />
            ))}
        </Reorder.Group>
    );
}

function ReorderItem({ item, type, isAdmin, isLocked, onToggleFuture, onDelete }: any) {
    const controls = useDragControls();

    return (
        <Reorder.Item
            value={item}
            dragListener={false}
            dragControls={controls}
            className="flex justify-between items-center p-4 border rounded-xl hover:border-blue-300 transition-all group"
            style={{ backgroundColor: 'var(--bg-main)', borderColor: 'var(--border)' }}
        >
            <div className="flex items-center gap-3">
                {!isLocked && (
                    <div 
                        onPointerDown={(e) => controls.start(e)}
                        className="cursor-grab active:cursor-grabbing p-1 hover:bg-slate-100 rounded-md transition-colors"
                        title="Drag to reorder"
                    >
                        <GripVertical size={18} className="text-slate-400" />
                    </div>
                )}
                
                <div 
                    onClick={() => !isLocked && onToggleFuture()}
                    className={`flex-1 ${!isLocked ? 'cursor-pointer hover:opacity-80' : ''}`}
                    title={!isLocked ? "Click to move between Current and Future Work" : ""}
                >
                    <div className="text-sm font-bold mb-1" style={{ color: 'var(--text-main)' }}>
                        {type === 'service' ? item.service_name : item.part_name}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                        {type === 'part' && item.part_no && (
                            <>
                                <Hash size={10} />
                                {item.part_no}
                                <span>•</span>
                            </>
                        )}
                        QTY: {item.quantity}
                    </div>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {isAdmin && (
                    <div className="text-sm font-black" style={{ color: 'var(--text-main)' }}>
                        ₹{(item.price * item.quantity).toLocaleString()}
                    </div>
                )}
                {!isLocked && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="icon-btn hover:text-red-500 hover:border-red-500/30 transition-all"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>
        </Reorder.Item>
    );
}
