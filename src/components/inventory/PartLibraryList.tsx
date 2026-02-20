'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Pencil, Layers, Tag, Wrench, Hash } from 'lucide-react';
import { deletePartLibraryItem } from '@/app/actions/inventory';

interface Part {
    id: number;
    name: string;
    part_no: string;
    brand: string | null;
    compatibility: string | null;
}

export default function PartLibraryList({ libraryParts, onEdit }: { libraryParts: any[], onEdit: (item: any) => void }) {
    const [parts, setParts] = useState<Part[]>(libraryParts);
    const [search, setSearch] = useState('');

    const filtered = parts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.part_no && p.part_no.toLowerCase().includes(search.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
    );

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to remove this master part definition? (This will NOT affect existing inventory stock)')) return;

        const res = await deletePartLibraryItem(id);
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
                        placeholder="Search library by name, brand, or part number..."
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
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Item Name</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Part #</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Brand</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Compatibility</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((part) => (
                            <tr key={part.id}>
                                <td>
                                    <div className="service-cell">
                                        <div
                                            className="w-8 h-8 rounded-lg border flex items-center justify-center"
                                            style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.05)', borderColor: 'var(--border)' }}
                                        >
                                            <Layers size={16} style={{ color: 'var(--text-muted)' }} />
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>{part.name}</span>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div
                                        className="flex items-center justify-center gap-2 font-mono text-xs font-bold px-2 py-1 rounded border w-fit mx-auto"
                                        style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.03)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                                    >
                                        <Hash size={12} style={{ opacity: 0.5 }} />
                                        {part.part_no || '—'}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider" style={{ color: 'var(--text-main)' }}>
                                        <Tag size={12} style={{ color: 'var(--primary)', opacity: 0.6 }} />
                                        {part.brand || 'Generic'}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-xs font-medium italic" style={{ color: 'var(--text-muted)' }}>
                                        <Wrench size={12} style={{ opacity: 0.4 }} />
                                        {part.compatibility || 'All Models'}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(part)}
                                            className="action-btn"
                                            title="Edit Library Entry"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(part.id)}
                                            className="action-btn hover:text-red-500 hover:border-red-200"
                                            title="Remove from Library"
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
                    <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Library item not found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>Build your part catalog by adding new items to the library.</p>
                </div>
            )}
        </div>
    );
}
