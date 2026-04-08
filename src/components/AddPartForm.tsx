'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Minus, X, Search, Check, Cpu, Loader2, Package, AlertTriangle, ShoppingCart, Pencil } from 'lucide-react';
import { addJobParts } from '@/app/actions/job';
import { toast } from 'sonner';

interface AddPartFormProps {
    jobId: number;
    masterParts: any[];
    isAdmin: boolean;
}

export default function AddPartForm({ jobId, masterParts, isAdmin }: AddPartFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedParts, setSelectedParts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedParts([]);
        setLoading(false);
    }

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => searchRef.current?.focus(), 80);
        function handleOutsideClick(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) handleClose();
        }
        function handleKey(e: KeyboardEvent) {
            if (e.key === 'Escape') handleClose();
        }
        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            clearTimeout(t);
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [isOpen]);

    const filtered = useMemo(() => {
        const list = (masterParts || []).filter(p => p && p.name);
        if (!query.trim()) return list;
        const q = query.toLowerCase();
        return list.filter(p =>
            p.name.toLowerCase().includes(q) ||
            (p.part_no || '').toLowerCase().includes(q)
        );
    }, [masterParts, query]);

    const togglePart = (part: any) => {
        if (selectedParts.find(p => p.id === part.id)) {
            setSelectedParts(prev => prev.filter(p => p.id !== part.id));
        } else {
            if (part.stock_quantity <= 0) {
                toast.error(`"${part.name}" is out of stock`);
                return;
            }
            setSelectedParts(prev => [...prev, { ...part, quantity: 1, customPrice: part.unit_price, isEditingPrice: false }]);
        }
    };

    const updatePartQuantity = (partId: number, delta: number) => {
        setSelectedParts(prev => prev.map(p => {
            if (p.id === partId) {
                const newQty = Math.max(1, (p.quantity || 1) + delta);
                if (newQty > p.stock_quantity) {
                    toast.error(`Only ${p.stock_quantity} unit${p.stock_quantity !== 1 ? 's' : ''} in stock`);
                    return p;
                }
                return { ...p, quantity: newQty };
            }
            return p;
        }));
    };

    const updatePartPrice = (partId: number, price: number) => {
        setSelectedParts(prev => prev.map(p => {
            if (p.id === partId) {
                return { ...p, customPrice: price };
            }
            return p;
        }));
    };

    const togglePriceEdit = (partId: number) => {
        setSelectedParts(prev => prev.map(p => {
            if (p.id === partId) {
                return { ...p, isEditingPrice: !p.isEditingPrice };
            }
            return { ...p, isEditingPrice: false };
        }));
    };



    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedParts.length === 0) return;
        setLoading(true);
        try {
            const res = await addJobParts(jobId, selectedParts.map(p => ({ 
                id: p.id, 
                quantity: p.quantity || 1,
                price: p.customPrice,
            })));
            if (res.success) {
                toast.success(`${selectedParts.length} part${selectedParts.length > 1 ? 's' : ''} added`);
                handleClose();
            } else {
                toast.error(res.error || 'Failed to add parts');
                setLoading(false);
            }
        } catch (err: any) {
            setLoading(false);
            toast.error('Failed to add parts. Please try again.');
            console.error(err);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    padding: '10px 20px', borderRadius: '12px',
                    background: 'var(--primary)', color: '#fff',
                    border: 'none', cursor: 'pointer', fontWeight: 700,
                    fontSize: '14px', boxShadow: '0 4px 14px rgba(59,130,246,0.35)',
                    transition: 'all 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.03)')}
                onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
            >
                <Plus size={16} strokeWidth={3} />
                Add Part
            </button>
        );
    }

    const totalSelected = selectedParts.length;
    const displayList = filtered.slice(0, 80);

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(6px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
            animation: 'fadeIn 0.15s ease',
        }}>
            <style>{`
                @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
                @keyframes slideUp { from { opacity:0; transform:translateY(20px) } to { opacity:1; transform:translateY(0) } }
                .part-row:hover { background: rgba(59,130,246,0.06) !important; }
                .part-row-selected:hover { background: rgba(59,130,246,0.18) !important; }
                .part-qty-btn:hover { background: rgba(59,130,246,0.2) !important; transform: scale(1.1); }
                .part-close-x:hover { background: rgba(239,68,68,0.12) !important; color: #ef4444 !important; }
                .part-cancel-btn:hover { border-color: var(--primary) !important; color: var(--primary) !important; }
            `}</style>

            <div ref={modalRef} style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '20px',
                width: '100%', maxWidth: '520px',
                maxHeight: '90vh',
                display: 'flex', flexDirection: 'column',
                boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
                animation: 'slideUp 0.2s ease',
                overflow: 'hidden',
            }}>

                {/* ── Header ── */}
                <div style={{
                    padding: '20px 24px 0',
                    display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{
                            width: '44px', height: '44px', borderRadius: '14px',
                            background: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                            flexShrink: 0,
                        }}>
                            <Package size={20} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                                Add Inventory Parts
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                Select one or more parts from inventory
                            </p>
                        </div>
                    </div>
                    <button
                        className="part-close-x"
                        type="button"
                        onClick={handleClose}
                        title="Close"
                        style={{
                            width: '34px', height: '34px', borderRadius: '10px',
                            border: '1px solid var(--border)', background: 'transparent',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', color: 'var(--text-muted)',
                            transition: 'all 0.15s', flexShrink: 0,
                        }}
                    >
                        <X size={16} />
                    </button>
                </div>

                {/* ── Search ── */}
                <div style={{ padding: '16px 24px 12px', flexShrink: 0 }}>
                    <div style={{
                        display: 'flex', alignItems: 'center', gap: '10px',
                        padding: '10px 14px',
                        background: 'var(--bg-main)',
                        border: '1.5px solid var(--border)',
                        borderRadius: '12px',
                    }}>
                        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by name or part number…"
                            style={{
                                border: 'none', outline: 'none', background: 'transparent',
                                fontSize: '14px', color: 'var(--text-main)', width: '100%',
                            }}
                        />
                        {query && (
                            <button type="button" onClick={() => setQuery('')}
                                style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                                <X size={14} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Selected chips strip ── */}
                {selectedParts.length > 0 && (
                    <div style={{
                        padding: '0 24px 10px',
                        display: 'flex', flexWrap: 'wrap', gap: '6px', flexShrink: 0,
                        borderBottom: '1px solid var(--border)',
                    }}>
                        {selectedParts.map(p => (
                            <div key={p.id} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '4px 10px', borderRadius: '999px',
                                background: 'rgba(59,130,246,0.12)',
                                border: '1px solid rgba(59,130,246,0.25)',
                                fontSize: '12px', fontWeight: 700, color: 'var(--primary)',
                            }}>
                                <span>{p.name}</span>
                                <span style={{ background: 'rgba(59,130,246,0.2)', borderRadius: '999px', padding: '0 5px', fontSize: '11px' }}>×{p.quantity}</span>
                                <button type="button" onClick={() => togglePart(p)}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--primary)', display: 'flex', padding: 0, marginLeft: '2px', opacity: 0.7 }}>
                                    <X size={11} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Parts List ── */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px' }} className="custom-scrollbar">
                        {displayList.length === 0 ? (
                            <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '13px' }}>
                                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                                No parts found for <strong>"{query}"</strong>
                            </div>
                        ) : (
                            displayList.map(p => {
                                const isSelected = !!selectedParts.find(sel => sel.id === p.id);
                                const selItem = selectedParts.find(sel => sel.id === p.id);
                                const outOfStock = p.stock_quantity <= 0;
                                return (
                                    <div
                                        key={p.id}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => !outOfStock && togglePart(p)}
                                        onKeyDown={e => e.key === 'Enter' && !outOfStock && togglePart(p)}
                                        className={isSelected ? 'part-row-selected' : 'part-row'}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '10px 12px',
                                            borderRadius: '12px',
                                            marginBottom: '3px',
                                            cursor: outOfStock ? 'not-allowed' : 'pointer',
                                            border: '1.5px solid',
                                            borderColor: isSelected ? 'rgba(59,130,246,0.4)' : 'transparent',
                                            background: isSelected ? 'rgba(59,130,246,0.07)' : outOfStock ? 'transparent' : 'var(--bg-main)',
                                            opacity: outOfStock ? 0.5 : 1,
                                            transition: 'all 0.15s',
                                            outline: 'none', userSelect: 'none',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                            {/* Checkbox */}
                                            <div style={{
                                                width: '22px', height: '22px', borderRadius: '7px', flexShrink: 0,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: isSelected ? 'none' : '1.5px solid var(--border)',
                                                background: isSelected ? 'linear-gradient(135deg,#3b82f6,#2563eb)' : 'var(--bg-card)',
                                                boxShadow: isSelected ? '0 2px 8px rgba(59,130,246,0.4)' : 'none',
                                                transition: 'all 0.15s',
                                            }}>
                                                {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                                            </div>

                                            {/* Info */}
                                            <div style={{ minWidth: 0 }}>
                                                <div style={{
                                                    fontSize: '13.5px', fontWeight: isSelected ? 700 : 500,
                                                    color: 'var(--text-main)',
                                                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                }}>
                                                    {p.name}
                                                </div>
                                                {p.part_no && (
                                                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '1px' }}>
                                                        {p.part_no}
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                                            {/* Quantity controls */}
                                            {isSelected && (
                                                <div
                                                    onClick={e => e.stopPropagation()}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '4px',
                                                        background: 'var(--bg-card)',
                                                        border: '1px solid var(--border)',
                                                        borderRadius: '8px', padding: '3px',
                                                    }}
                                                >
                                                    <button type="button" className="part-qty-btn"
                                                        onClick={() => updatePartQuantity(p.id, -1)}
                                                        style={{
                                                            width: '24px', height: '24px', borderRadius: '6px',
                                                            border: 'none', background: 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            cursor: 'pointer', color: 'var(--primary)', transition: 'all 0.15s',
                                                        }}>
                                                        <Minus size={12} strokeWidth={3} />
                                                    </button>
                                                    <span style={{ fontSize: '12px', fontWeight: 800, minWidth: '20px', textAlign: 'center', color: 'var(--text-main)' }}>
                                                        {selItem?.quantity || 1}
                                                    </span>
                                                    <button type="button" className="part-qty-btn"
                                                        onClick={() => updatePartQuantity(p.id, 1)}
                                                        style={{
                                                            width: '24px', height: '24px', borderRadius: '6px',
                                                            border: 'none', background: 'transparent',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            cursor: 'pointer', color: 'var(--primary)', transition: 'all 0.15s',
                                                        }}>
                                                        <Plus size={12} strokeWidth={3} />
                                                    </button>
                                                </div>
                                            )}

                                             {/* Right info */}
                                            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                {isAdmin && (
                                                    <div 
                                                        onClick={(e) => { e.stopPropagation(); togglePriceEdit(p.id); }}
                                                        style={{ 
                                                            display: 'flex', alignItems: 'center', gap: '6px', 
                                                            cursor: 'pointer', padding: '4px 8px', borderRadius: '6px',
                                                            background: selItem?.isEditingPrice ? 'rgba(59,130,246,0.1)' : 'transparent',
                                                            transition: 'all 0.15s',
                                                            border: selItem?.isEditingPrice ? '1px solid rgba(59,130,246,0.3)' : '1px solid transparent'
                                                        }}
                                                    >
                                                        {!selItem?.isEditingPrice && <Pencil size={11} style={{ opacity: 0.5 }} />}
                                                        {selItem?.isEditingPrice ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                                                <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text-muted)' }}>₹</span>
                                                                <input
                                                                    autoFocus
                                                                    type="number"
                                                                    value={selItem.customPrice}
                                                                    onChange={(e) => updatePartPrice(p.id, Number(e.target.value))}
                                                                    onClick={(e) => e.stopPropagation()}
                                                                    style={{
                                                                        width: '60px', border: 'none', background: 'transparent',
                                                                        fontSize: '13px', fontWeight: 800, color: '#3b82f6',
                                                                        outline: 'none', padding: 0
                                                                    }}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <div style={{ fontSize: '13px', fontWeight: 800, color: isSelected ? '#3b82f6' : 'var(--text-main)' }}>
                                                                ₹{selItem ? selItem.customPrice : p.unit_price}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                <div style={{
                                                    fontSize: '10px', fontWeight: 700,
                                                    color: outOfStock ? '#ef4444' : p.stock_quantity < 5 ? '#f59e0b' : 'var(--primary)',
                                                    display: 'flex', alignItems: 'center', gap: '3px',
                                                }}>
                                                    {outOfStock && <AlertTriangle size={9} />}
                                                    {outOfStock ? 'OUT OF STOCK' : `${p.stock_quantity} in stock`}
                                                </div>


                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* ── Footer ── */}
                    <div style={{
                        padding: '16px 24px',
                        borderTop: '1px solid var(--border)',
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        gap: '12px', flexShrink: 0,
                        background: 'var(--bg-card)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                            <ShoppingCart size={15} />
                            {totalSelected === 0
                                ? <span>Nothing selected</span>
                                : <span><strong style={{ color: 'var(--text-main)' }}>{totalSelected}</strong> part{totalSelected > 1 ? 's' : ''}</span>
                            }
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button type="button" className="part-cancel-btn" onClick={handleClose} disabled={loading}
                                style={{
                                    padding: '9px 18px', borderRadius: '10px',
                                    border: '1.5px solid var(--border)', background: 'transparent',
                                    color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}>
                                Cancel
                            </button>
                            <button type="submit" disabled={totalSelected === 0 || loading}
                                style={{
                                    padding: '9px 20px', borderRadius: '10px',
                                    background: totalSelected === 0 ? 'var(--border)' : 'linear-gradient(135deg,#3b82f6,#2563eb)',
                                    color: totalSelected === 0 ? 'var(--text-muted)' : '#fff',
                                    border: 'none', fontWeight: 700, fontSize: '13px',
                                    cursor: totalSelected === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: totalSelected > 0 ? '0 4px 14px rgba(59,130,246,0.35)' : 'none',
                                    transition: 'all 0.2s',
                                    minWidth: '120px', justifyContent: 'center',
                                }}>
                                {loading ? (
                                    <><Loader2 className="animate-spin" size={15} /> Saving…</>
                                ) : (
                                    <><Plus size={15} strokeWidth={3} /> Save {totalSelected > 0 ? `(${totalSelected})` : 'Parts'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
