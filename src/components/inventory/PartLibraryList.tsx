'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Pencil, Layers, Tag, Wrench, Hash } from 'lucide-react';
import { deleteMasterPart } from '@/app/actions/inventory';

interface Part {
    id: number;
    name: string;
    part_no: string;
    brand: string | null;
    compatibility: string | null;
}

export default function PartLibraryList({ initialParts, onEdit }: { initialParts: any[], onEdit: (item: any) => void }) {
    const [parts, setParts] = useState<Part[]>(initialParts);
    const [search, setSearch] = useState('');

    const filtered = parts.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        (p.part_no && p.part_no.toLowerCase().includes(search.toLowerCase())) ||
        (p.brand && p.brand.toLowerCase().includes(search.toLowerCase()))
    );

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to remove this part from the library?')) return;

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
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Item Name</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Part #</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Brand</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-left">Compatibility</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((part) => (
                            <tr key={part.id}>
                                <td>
                                    <div className="service-cell">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400">
                                            <Layers size={16} />
                                        </div>
                                        <span className="font-bold text-slate-900">{part.name}</span>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-500 font-mono text-xs font-bold bg-slate-50 px-2 py-1 rounded border border-slate-100 w-fit mx-auto">
                                        <Hash size={12} className="text-slate-400" />
                                        {part.part_no || '—'}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <div className="flex items-center justify-center gap-2 text-slate-600 font-bold text-xs uppercase tracking-wider">
                                        <Tag size={12} className="text-primary/60" />
                                        {part.brand || 'Generic'}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium italic">
                                        <Wrench size={12} className="text-slate-300" />
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
                    <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-100">
                        <Layers size={32} />
                    </div>
                    <h3 className="text-slate-900 text-lg font-semibold mb-2">Library item not found</h3>
                    <p className="text-slate-500 text-base max-w-xs mx-auto">Build your part catalog by adding new items to the library.</p>
                </div>
            )}
        </div>
    );
}
