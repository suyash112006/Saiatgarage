'use client';

import { useState, Fragment } from 'react';
import { Search, Plus, Trash2, Pencil, Car, ChevronRight } from 'lucide-react';
import { deleteCarLibraryItem } from '@/app/actions/inventory';

interface LibraryItem {
    id: number;
    brand: string;
    model: string;
}

export default function CarLibraryList({ initialLibrary, onEdit }: { initialLibrary: LibraryItem[], onEdit: (item: any) => void }) {
    const [search, setSearch] = useState('');

    const filtered = initialLibrary.filter(item =>
        item.brand.toLowerCase().includes(search.toLowerCase()) ||
        item.model.toLowerCase().includes(search.toLowerCase())
    );

    // Grouping logic: Brand -> Models
    const grouped = filtered.reduce((acc: { [key: string]: LibraryItem[] }, item) => {
        if (!acc[item.brand]) {
            acc[item.brand] = [];
        }
        acc[item.brand].push(item);
        return acc;
    }, {});

    const brands = Object.keys(grouped).sort();

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to remove this model from the library?')) return;

        const res = await deleteCarLibraryItem(id);
        if (res.success) {
            // No need for local state update, parent will refresh
        } else if (res.error) {
            alert(res.error);
        }
    }

    return (
        <div className="card max-w-full">
            {/* Search Section */}
            <div className="px-8 py-4">
                <div className="search-wrap">
                    <Search />
                    <input
                        type="text"
                        placeholder="Search by brand or model..."
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
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Brand</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Model Name</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {brands.map(brand => (
                            <Fragment key={brand}>
                                <tr style={{ background: 'var(--bg-main)', opacity: 0.8 }}>
                                    <td colSpan={3} className="py-3 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
                                                <Car size={16} />
                                            </div>
                                            <span style={{ fontWeight: 900, color: 'var(--text-main)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '14px' }}>{brand}</span>
                                            <span style={{ fontSize: '10px', fontWeight: 700, background: 'rgba(var(--text-main-rgb, 0,0,0), 0.1)', color: 'var(--text-muted)', padding: '2px 8px', borderRadius: '999px' }}>
                                                {grouped[brand].length} MODELS
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                                {grouped[brand].map(item => (
                                    <tr key={item.id} className="group transition-colors hover:bg-slate-50/10">
                                        <td className="py-4 px-6 border-r w-48" style={{ borderColor: 'var(--border)' }}>
                                            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{brand}</span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <ChevronRight size={14} style={{ color: 'var(--text-muted)', opacity: 0.5 }} className="group-hover:text-blue-500 transition-colors" />
                                                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>{item.model}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="action-btn"
                                                    title="Edit Model"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item.id)}
                                                    className="action-btn hover:text-red-500 hover:border-red-200"
                                                    title="Delete Model"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </Fragment>
                        ))}
                    </tbody>
                </table>
            </div>

            {brands.length === 0 && (
                <div className="py-24 text-center border-t" style={{ borderColor: 'var(--border)' }}>
                    <div
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 border"
                        style={{ background: 'rgba(var(--text-main-rgb, 0,0,0), 0.05)', borderColor: 'var(--border)' }}
                    >
                        <Car size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>Car library is empty</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>Start building your vehicle database by adding brands and models.</p>
                </div>
            )}
        </div>
    );
}
