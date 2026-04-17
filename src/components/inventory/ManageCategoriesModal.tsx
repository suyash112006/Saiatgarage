'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Plus, Trash2, Edit2, Check, Loader2, Tags } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { addPartCategory, updatePartCategory, deletePartCategory } from '@/app/actions/inventory';

export default function ManageCategoriesModal({ 
    categories, 
    onClose 
}: { 
    categories: any[], 
    onClose: (result?: { success: boolean, data?: any, deletedId?: number }) => void 
}) {
    const router = useRouter();
    const [localCategories, setLocalCategories] = useState([...categories].sort((a, b) => a.name.localeCompare(b.name)));
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    
    // Form state
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [nameVal, setNameVal] = useState('');
    const [colorVal, setColorVal] = useState('#6b7280');

    useEffect(() => {
        function handleOutsideClick(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                onClose();
            }
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') onClose();
        }
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    function startAdding() {
        setIsAdding(true);
        setEditingId(null);
        setNameVal('');
        setColorVal('#6b7280');
    }

    function startEditing(cat: any) {
        setIsAdding(false);
        setEditingId(cat.id);
        setNameVal(cat.name);
        setColorVal(cat.color || '#6b7280');
    }

    function cancelEdit() {
        setIsAdding(false);
        setEditingId(null);
    }

    async function handleSave() {
        if (!nameVal.trim()) {
            toast.error('Category name is required');
            return;
        }

        setLoading(true);
        const fd = new FormData();
        fd.append('name', nameVal);
        fd.append('color', colorVal);

        if (editingId) {
            fd.append('id', String(editingId));
            const res = await updatePartCategory(fd);
            if (res.success) {
                toast.success('Category updated');
                setLocalCategories(prev => 
                    prev.map(c => c.id === editingId ? res.data : c)
                        .sort((a, b) => a.name.localeCompare(b.name))
                );
                setEditingId(null);
                router.refresh(); // Direct background update
            } else {
                toast.error(res.error || 'Failed to update');
            }
        } else {
            const res = await addPartCategory(fd);
            if (res.success) {
                toast.success('Category added');
                setLocalCategories(prev => 
                    [...prev, res.data]
                        .sort((a, b) => a.name.localeCompare(b.name))
                );
                setIsAdding(false);
                router.refresh(); // Direct background update
            } else {
                toast.error(res.error || 'Failed to add category');
            }
        }
        setLoading(false);
    }

    async function handleDelete(id: number, name: string) {
        if (!confirm(`Are you sure you want to delete the "${name}" category? Parts in this category will be moved to General.`)) return;
        
        setLoading(true);
        const res = await deletePartCategory(id);
        if (res.success) {
            toast.success('Category deleted');
            setLocalCategories(prev => prev.filter(c => c.id !== id));
            router.refresh(); // Direct background update
        } else {
            toast.error(res.error || 'Failed to delete');
        }
        setLoading(false);
    }

    return (
        <div className="modal-overlay" onClick={() => onClose()}>
            <div ref={modalRef} className="modal-content" style={{ maxWidth: '500px', padding: 0 }} onClick={(e) => e.stopPropagation()}>
                
                {/* ── Header ── */}
                <div style={{ padding: '24px 24px 0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                            flexShrink: 0, color: '#fff'
                        }}>
                            <Tags size={22} />
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 800, margin: 0 }}>Manage Part Categories</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', margin: '2px 0 0' }}>Add, edit or remove inventory categories</p>
                        </div>
                    </div>
                    <button onClick={() => onClose()} className="icon-btn" style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '10px', padding: '8px' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* ── Search/Add Bar ── */}
                <div style={{ padding: '20px 24px 12px' }}>
                    {isAdding ? (
                        <div className="card" style={{ padding: '12px', border: '1px solid var(--primary)', borderRadius: '14px', background: 'rgba(59,130,246,0.05)' }}>
                            <div className="flex items-center gap-3">
                                <div className="input-wrapper" style={{ flex: 1, height: '40px' }}>
                                    <input 
                                        autoFocus
                                        type="text" 
                                        value={nameVal}
                                        onChange={e => setNameVal(e.target.value)}
                                        placeholder="Category name..."
                                        style={{ fontWeight: 700 }}
                                    />
                                </div>
                                <button onClick={handleSave} disabled={loading} className="icon-btn" style={{ color: 'var(--primary)', background: 'rgba(59,130,246,0.1)' }}>
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                                </button>
                                <button onClick={cancelEdit} className="icon-btn" style={{ color: 'var(--text-muted)' }}>
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div 
                            onClick={startAdding}
                            className="input-wrapper" 
                            style={{ height: '44px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '12px' }}
                        >
                            <span style={{ color: 'var(--text-muted)', fontSize: '14px', fontWeight: 500 }}>Add New Category...</span>
                        </div>
                    )}
                </div>

                {/* ── List Body ── */}
                <div className="modal-body custom-scrollbar" style={{ padding: '0 24px 20px', maxHeight: '50vh', overflowY: 'auto' }}>
                    <div className="space-y-2">
                        {localCategories.map(cat => (
                            <div key={cat.id}>
                                {editingId === cat.id ? (
                                    <div className="card" style={{ padding: '12px', border: '1px solid var(--primary)', borderRadius: '14px', background: 'rgba(59,130,246,0.05)' }}>
                                        <div className="flex items-center gap-3">
                                            <div className="input-wrapper" style={{ flex: 1, height: '40px' }}>
                                                <input 
                                                    autoFocus
                                                    type="text" 
                                                    value={nameVal}
                                                    onChange={e => setNameVal(e.target.value)}
                                                    style={{ fontWeight: 700 }}
                                                />
                                            </div>
                                            <button onClick={handleSave} disabled={loading} className="icon-btn" style={{ color: 'var(--primary)', background: 'rgba(59,130,246,0.1)' }}>
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : <Check size={18} strokeWidth={3} />}
                                            </button>
                                            <button onClick={cancelEdit} className="icon-btn" style={{ color: 'var(--text-muted)' }}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div 
                                        style={{ 
                                            display: 'flex',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '14px 18px',
                                            borderRadius: '14px',
                                            background: 'rgba(255,255,255,0.03)',
                                            border: '1px solid var(--border)',
                                            transition: 'all 0.2s',
                                            cursor: 'default',
                                        }}
                                    >
                                        <span style={{ color: 'var(--text-main)', fontWeight: 700, fontSize: '14px', letterSpacing: '-0.01em' }}>
                                            {cat.name}
                                        </span>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                                            <button 
                                                onClick={() => startEditing(cat)} 
                                                title="Edit"
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    width: '32px', height: '32px', borderRadius: '8px',
                                                    border: '1px solid var(--border)', background: 'var(--bg-main)',
                                                    color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s'
                                                }}
                                            >
                                                <Edit2 size={13} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat.id, cat.name)} 
                                                title="Delete"
                                                style={{ 
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    width: '32px', height: '32px', borderRadius: '8px',
                                                    border: '1px solid var(--border)', background: 'var(--bg-main)',
                                                    color: 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s'
                                                }}
                                            >
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Footer ── */}
                <div style={{
                    padding: '20px 24px',
                    borderTop: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(0,0,0,0.1)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                        <Tags size={16} />
                        {localCategories.length} categories total
                    </div>
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="btn btn-outline"
                            style={{ padding: '10px 24px', borderRadius: '12px' }}
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={() => onClose()}
                            className="btn btn-primary"
                            style={{ 
                                padding: '10px 24px', borderRadius: '12px',
                                background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                                border: 'none', boxShadow: '0 4px 12px rgba(59,130,246,0.3)'
                            }}
                        >
                            Done
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
