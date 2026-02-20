'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Pencil, Layers, IndianRupee, Hash } from 'lucide-react';
import { deleteMasterPart } from '@/app/actions/inventory';

interface Part {
    id: number;
    name: string;
    part_no: string;
    unit_price: number;
    stock_quantity: number;
    total_value: number;
}

export default function PartInventoryList({ initialParts, onEdit }: { initialParts: any[], onEdit: (item: any) => void }) {
    const [parts, setParts] = useState<Part[]>(initialParts);
    const [search, setSearch] = useState('');

    const filtered = parts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.part_no && p.part_no.toLowerCase().includes(search.toLowerCase()))
    );

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this part?')) return;

        const res = await deleteMasterPart(id);
        if (res.success) {
            setParts(parts.filter(p => p.id !== id));
        } else if (res.error) {
            alert(res.error);
        }
    }

    return (
        <div className="card max-w-full">
            {/* Search Section */}
            <div className="px-8 pb-4">
                <div className="search-wrap">
                    <Search />
                    <input
                        type="text"
                        placeholder="Search parts by name or ID..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Table Section */}
            <div className="table-responsive">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Part Info</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Stock (Qua)</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>Price</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>Total</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((part) => (
                            <tr key={part.id}>
                                <td>
                                    <div className="service-cell">
                                        <Layers size={20} />
                                        <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>{part.name}</span>
                                    </div>
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
                                            onClick={() => handleDelete(part.id)}
                                            className="action-btn hover:text-red-500 hover:border-red-200"
                                            title="Delete Part"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
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
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>Try refining your search keywords or add a new part to the inventory.</p>
                </div>
            )}
        </div>
    );
}
