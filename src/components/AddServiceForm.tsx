'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { Plus, Minus, X, Search, Check, Wrench, Loader2, Zap, ChevronRight, ShoppingCart, Pencil } from 'lucide-react';
import { addJobServices } from '@/app/actions/job';
import { toast } from 'sonner';

interface AddServiceFormProps {
    jobId: number;
    masterServices: any[];
    isAdmin: boolean;
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; icon: string }> = {
    ELECTRICAL: { bg: 'rgba(234,179,8,0.12)', text: '#eab308', icon: '⚡' },
    GENERAL:    { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', icon: '🔧' },
    MECHANICAL: { bg: 'rgba(239,68,68,0.12)', text: '#ef4444', icon: '⚙️' },
    BODYWORK:   { bg: 'rgba(168,85,247,0.12)', text: '#a855f7', icon: '🚗' },
    AC:         { bg: 'rgba(6,182,212,0.12)', text: '#06b6d4', icon: '❄️' },
    TYRES:      { bg: 'rgba(59,130,246,0.12)', text: '#3b82f6', icon: '🔴' },
};

function getCategoryStyle(cat: string) {
    const upper = (cat || 'GENERAL').toUpperCase();
    return CATEGORY_COLORS[upper] || { bg: 'rgba(100,116,139,0.12)', text: '#64748b', icon: '🔩' };
}

export default function AddServiceForm({ jobId, masterServices, isAdmin }: AddServiceFormProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedServices, setSelectedServices] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    function handleClose() {
        setIsOpen(false);
        setQuery('');
        setSelectedServices([]);
        setLoading(false);
    }

    useEffect(() => {
        if (!isOpen) return;
        const t = setTimeout(() => searchRef.current?.focus(), 80);
        function handleOutsideClick(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                handleClose();
            }
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
        const list = (masterServices || []).filter(s => s && s.name);
        
        let filteredList = list;
        if (query.trim()) {
            const q = query.toLowerCase();
            filteredList = list.filter(s =>
                s.name.toLowerCase().includes(q) ||
                (s.category || '').toLowerCase().includes(q)
            );
        }
        
        return [...filteredList].sort((a, b) => a.name.localeCompare(b.name));
    }, [masterServices, query]);

    // Group by category
    const grouped = useMemo(() => {
        const map: Record<string, any[]> = {};
        (filtered.slice(0, 80)).forEach(s => {
            const cat = (s.category || 'GENERAL').toUpperCase();
            if (!map[cat]) map[cat] = [];
            map[cat].push(s);
        });
        return Object.entries(map).sort(([a], [b]) => a.localeCompare(b));
    }, [filtered]);

    const toggleService = (service: any) => {
        if (selectedServices.find(s => s.id === service.id)) {
            setSelectedServices(prev => prev.filter(s => s.id !== service.id));
        } else {
            setSelectedServices(prev => [...prev, { ...service, quantity: 1, customPrice: service.base_price, isEditingPrice: false }]);
        }
    };

    const updateServiceQuantity = (serviceId: number, delta: number) => {
        setSelectedServices(prev => prev.map(s => {
            if (s.id === serviceId) {
                return { ...s, quantity: Math.max(1, (s.quantity || 1) + delta) };
            }
            return s;
        }));
    };

    const updateServicePrice = (serviceId: number, price: number) => {
        setSelectedServices(prev => prev.map(s => {
            if (s.id === serviceId) {
                return { ...s, customPrice: price };
            }
            return s;
        }));
    };

    const togglePriceEdit = (serviceId: number) => {
        setSelectedServices(prev => prev.map(s => {
            if (s.id === serviceId) {
                return { ...s, isEditingPrice: !s.isEditingPrice };
            }
            return { ...s, isEditingPrice: false };
        }));
    };



    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (selectedServices.length === 0) return;
        setLoading(true);
        try {
            const res = await addJobServices(jobId, selectedServices.map(s => ({ 
                id: s.id, 
                quantity: s.quantity || 1, 
                price: s.customPrice,
            })));
            if (res.success) {
                toast.success(`${selectedServices.length} service${selectedServices.length > 1 ? 's' : ''} added`);
                handleClose();
            } else {
                toast.error(res.error || 'Failed to add services');
                setLoading(false);
            }
        } catch (err) {
            setLoading(false);
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
                Add Service
            </button>
        );
    }

    const totalSelected = selectedServices.length;

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
                .svc-row:hover { background: rgba(59,130,246,0.06) !important; }
                .svc-row-selected:hover { background: rgba(59,130,246,0.18) !important; }
                .qty-btn:hover { background: rgba(59,130,246,0.2) !important; transform: scale(1.1); }
                .close-x:hover { background: rgba(239,68,68,0.12) !important; color: #ef4444 !important; }
                .cancel-btn:hover { border-color: var(--primary) !important; color: var(--primary) !important; }
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
                            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(59,130,246,0.4)',
                            flexShrink: 0,
                        }}>
                            <Wrench size={20} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.3px' }}>
                                Add Job Services
                            </h3>
                            <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-muted)' }}>
                                Select one or more services to add
                            </p>
                        </div>
                    </div>
                    <button
                        className="close-x"
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
                        transition: 'border-color 0.2s',
                    }}
                        onFocus={() => {}}
                    >
                        <Search size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                        <input
                            ref={searchRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search by name or category…"
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
                {selectedServices.length > 0 && (
                    <div style={{
                        padding: '0 24px 10px',
                        display: 'flex', flexWrap: 'wrap', gap: '6px', flexShrink: 0,
                        borderBottom: '1px solid var(--border)',
                    }}>
                        {selectedServices.map(s => (
                            <div key={s.id} style={{
                                display: 'flex', alignItems: 'center', gap: '6px',
                                padding: '4px 10px', borderRadius: '999px',
                                background: 'rgba(59,130,246,0.12)',
                                border: '1px solid rgba(59,130,246,0.25)',
                                fontSize: '12px', fontWeight: 700, color: '#3b82f6',
                            }}>
                                <span>{s.name}</span>
                                <span style={{
                                    background: 'rgba(59,130,246,0.2)', borderRadius: '999px',
                                    padding: '0 5px', fontSize: '11px',
                                }}>×{s.quantity}</span>
                                <button type="button" onClick={() => toggleService(s)}
                                    style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#3b82f6', display: 'flex', padding: 0, marginLeft: '2px', opacity: 0.7 }}>
                                    <X size={11} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* ── Service List ── */}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
                    <div style={{ flex: 1, overflowY: 'auto', padding: '8px 24px' }} className="custom-scrollbar">
                        {grouped.length === 0 ? (
                            <div style={{
                                padding: '48px 24px', textAlign: 'center',
                                color: 'var(--text-muted)', fontSize: '13px',
                            }}>
                                <Search size={32} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                                No services found for <strong>"{query}"</strong>
                            </div>
                        ) : (
                            grouped.map(([cat, services]) => {
                                const style = getCategoryStyle(cat);
                                return (
                                    <div key={cat} style={{ marginBottom: '16px' }}>
                                        {/* Category header */}
                                        <div style={{
                                            display: 'flex', alignItems: 'center', gap: '8px',
                                            padding: '6px 0', marginBottom: '4px',
                                        }}>
                                            <span style={{ fontSize: '13px' }}>{style.icon}</span>
                                            <span style={{
                                                fontSize: '10px', fontWeight: 800,
                                                letterSpacing: '0.08em', textTransform: 'uppercase',
                                                color: style.text,
                                            }}>{cat}</span>
                                            <div style={{
                                                flex: 1, height: '1px',
                                                background: `linear-gradient(to right, ${style.text}40, transparent)`,
                                            }} />
                                            <span style={{
                                                fontSize: '10px', fontWeight: 700,
                                                color: style.text, opacity: 0.7,
                                            }}>{services.length}</span>
                                        </div>

                                        {/* Service rows */}
                                        {services.map(s => {
                                            const isSelected = !!selectedServices.find(sel => sel.id === s.id);
                                            const selItem = selectedServices.find(sel => sel.id === s.id);
                                            return (
                                                <div
                                                    key={s.id}
                                                    role="button"
                                                    tabIndex={0}
                                                    onClick={() => toggleService(s)}
                                                    onKeyDown={e => e.key === 'Enter' && toggleService(s)}
                                                    className={isSelected ? 'svc-row-selected' : 'svc-row'}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '10px 14px',
                                                        borderRadius: '12px',
                                                        marginBottom: '3px',
                                                        cursor: 'pointer',
                                                        border: '1.5px solid',
                                                        borderColor: isSelected ? 'rgba(59,130,246,0.4)' : 'transparent',
                                                        background: isSelected ? 'rgba(59,130,246,0.08)' : 'var(--bg-main)',
                                                        transition: 'all 0.15s',
                                                        outline: 'none',
                                                        userSelect: 'none',
                                                    }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                                                        {/* Checkbox */}
                                                        <div style={{
                                                            width: '22px', height: '22px', borderRadius: '7px', flexShrink: 0,
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            border: isSelected ? 'none' : '1.5px solid var(--border)',
                                                            background: isSelected
                                                                ? 'linear-gradient(135deg,#3b82f6,#6366f1)'
                                                                : 'var(--bg-card)',
                                                            boxShadow: isSelected ? '0 2px 8px rgba(59,130,246,0.4)' : 'none',
                                                            transition: 'all 0.15s',
                                                        }}>
                                                            {isSelected && <Check size={13} color="#fff" strokeWidth={3} />}
                                                        </div>
                                                        <span style={{
                                                            fontSize: '14px', fontWeight: isSelected ? 700 : 600,
                                                            color: isSelected ? 'var(--text-main)' : 'var(--text-main)',
                                                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                                                        }}>
                                                            {s.name}
                                                        </span>
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
                                                                <button
                                                                    type="button"
                                                                    className="qty-btn"
                                                                    onClick={() => updateServiceQuantity(s.id, -1)}
                                                                    style={{
                                                                        width: '24px', height: '24px', borderRadius: '6px',
                                                                        border: 'none', background: 'transparent',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        cursor: 'pointer', color: '#3b82f6', transition: 'all 0.15s',
                                                                    }}
                                                                >
                                                                    <Minus size={12} strokeWidth={3} />
                                                                </button>
                                                                <span style={{
                                                                    fontSize: '12px', fontWeight: 800, minWidth: '20px',
                                                                    textAlign: 'center', color: 'var(--text-main)',
                                                                }}>
                                                                    {selItem?.quantity || 1}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    className="qty-btn"
                                                                    onClick={() => updateServiceQuantity(s.id, 1)}
                                                                    style={{
                                                                        width: '24px', height: '24px', borderRadius: '6px',
                                                                        border: 'none', background: 'transparent',
                                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                        cursor: 'pointer', color: '#3b82f6', transition: 'all 0.15s',
                                                                    }}
                                                                >
                                                                    <Plus size={12} strokeWidth={3} />
                                                                </button>
                                                            </div>
                                                        )}

                                                         {/* Price */}
                                                        {isAdmin && (
                                                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                                                                <div 
                                                                    onClick={(e) => { e.stopPropagation(); togglePriceEdit(s.id); }}
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
                                                                                onChange={(e) => updateServicePrice(s.id, Number(e.target.value))}
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                style={{
                                                                                    width: '60px', border: 'none', background: 'transparent',
                                                                                    fontSize: '13px', fontWeight: 800, color: '#3b82f6',
                                                                                    outline: 'none', padding: 0
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    ) : (
                                                                        <span style={{
                                                                            fontSize: '13px', fontWeight: 800,
                                                                            color: isSelected ? '#3b82f6' : 'var(--text-muted)',
                                                                        }}>
                                                                            ₹{selItem ? selItem.customPrice : s.base_price}
                                                                        </span>
                                                                    )}
                                                                </div>


                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
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
                        {/* Selection count */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px' }}>
                            <ShoppingCart size={15} />
                            {totalSelected === 0
                                ? <span>Nothing selected</span>
                                : <span><strong style={{ color: 'var(--text-main)' }}>{totalSelected}</strong> service{totalSelected > 1 ? 's' : ''}</span>
                            }
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={handleClose}
                                disabled={loading}
                                style={{
                                    padding: '9px 18px', borderRadius: '10px',
                                    border: '1.5px solid var(--border)', background: 'transparent',
                                    color: 'var(--text-muted)', fontWeight: 600, fontSize: '13px',
                                    cursor: 'pointer', transition: 'all 0.15s',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={totalSelected === 0 || loading}
                                style={{
                                    padding: '9px 20px', borderRadius: '10px',
                                    background: totalSelected === 0 ? 'var(--border)' : 'linear-gradient(135deg,#3b82f6,#6366f1)',
                                    color: totalSelected === 0 ? 'var(--text-muted)' : '#fff',
                                    border: 'none', fontWeight: 700, fontSize: '13px',
                                    cursor: totalSelected === 0 ? 'not-allowed' : 'pointer',
                                    display: 'flex', alignItems: 'center', gap: '8px',
                                    boxShadow: totalSelected > 0 ? '0 4px 14px rgba(59,130,246,0.35)' : 'none',
                                    transition: 'all 0.2s',
                                    minWidth: '130px', justifyContent: 'center',
                                }}
                            >
                                {loading ? (
                                    <><Loader2 className="animate-spin" size={15} /> Saving…</>
                                ) : (
                                    <><Plus size={15} strokeWidth={3} /> Save {totalSelected > 0 ? `(${totalSelected})` : 'Services'}</>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
