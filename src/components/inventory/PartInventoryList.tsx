'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Pencil, Layers, IndianRupee, Tag } from 'lucide-react';

interface Part {
    id: number;
    name: string;
    part_no: string;
    unit_price: number;
    stock_quantity: number;
    total_value: number;
    category?: string;
}

export default function PartInventoryList({ initialParts, categories, onEdit, onDelete }: { initialParts: Part[], categories: any[], onEdit: (item: Part) => void, onDelete: (id: number) => void }) {
    const parts = initialParts;
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');

    const filtered = parts.filter(p => {
        const matchSearch =
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            (p.part_no && p.part_no.toLowerCase().includes(search.toLowerCase()));
        const matchCategory =
            selectedCategory === 'All' || (p.category || 'General') === selectedCategory;
        return matchSearch && matchCategory;
    });

    return (
        <div className="card max-w-full">
            {/* Search + Category Filter */}
            <div className="table-toolbar" style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div className="search-box" style={{ width: '280px', margin: 0 }}>
                    <Search size={16} />
                    <input
                        type="text"
                        placeholder="Search by name, brand, or part number..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                {/* Category Select — right of search bar */}
                <div className="input-wrapper" style={{ width: '180px', margin: 0, position: 'relative' }}>
                    <Tag size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none', zIndex: 1 }} />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ paddingLeft: '36px', width: '100%' }}
                    >
                        <option value="All">-- All Categories --</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Table Section */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Part Info</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Category</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Stock (Qua)</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>Price</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>Total</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((part) => {
                            const cat = part.category || 'General';
                            const catTheme = categories.find(c => c.name === cat)?.color || '#6b7280';
                            return (
                                <tr key={part.id}>
                                    <td>
                                        <div className="service-cell">
                                            <Layers size={20} />
                                            <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{part.name}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="badge category-badge" style={{ 
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '5px',
                                            padding: '3px 10px',
                                            borderRadius: '9999px',
                                            fontSize: '11px',
                                            fontWeight: 700,
                                            letterSpacing: '0.04em',
                                            backgroundColor: `${catTheme}20`,
                                            color: catTheme,
                                            border: `1px solid ${catTheme}40`,
                                            whiteSpace: 'nowrap',
                                        }}>
                                            {cat}
                                        </span>
                                    </td>
                                    <td className="text-center">
                                        <span className={`badge ${part.stock_quantity > 5 ? 'stock-ok' : 'stock-low'}`}>
                                            {part.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="text-right">
                                        <div className="price text-sm font-bold" style={{ color: 'var(--text-muted)' }}>
                                            <IndianRupee size={15} />
                                            {part.unit_price.toLocaleString()}
                                        </div>
                                    </td>
                                    <td className="text-right">
                                        <div className="price font-black text-base" style={{ color: 'var(--text-main)' }}>
                                            <IndianRupee size={16} />
                                            {(part.total_value || (part.unit_price * part.stock_quantity)).toLocaleString()}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => onEdit(part)}
                                                className="action-btn"
                                                title="Edit Part"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                            <button
                                                onClick={() => onDelete(part.id)}
                                                className="action-btn hover:text-red-500 hover:border-red-200"
                                                title="Delete Part"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filtered.length === 0 && (
                <div className="py-20 text-center">
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border"
                        style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.05)', borderColor: 'var(--border)' }}
                    >
                        <Layers size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No parts found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>Try refining your search or category filter, or add a new part to the inventory.</p>
                </div>
            )}
        </div>
    );
}
