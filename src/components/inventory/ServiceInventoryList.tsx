'use client';

import { useState } from 'react';
import { Search, Plus, Trash2, Pencil, Wrench, IndianRupee } from 'lucide-react';
import { deleteMasterService } from '@/app/actions/inventory';

interface Service {
    id: number;
    name: string;
    category: string;
    base_price: number;
}

export default function ServiceInventoryList({ initialServices, onEdit }: { initialServices: any[], onEdit: (item: any) => void }) {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [search, setSearch] = useState('');

    const filtered = services.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.category.toLowerCase().includes(search.toLowerCase())
    );

    async function handleDelete(id: number) {
        if (!confirm('Are you sure you want to delete this service?')) return;

        const res = await deleteMasterService(id);
        if (res.success) {
            setServices(services.filter(s => s.id !== id));
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
                        placeholder="Search services or categories..."
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
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-left" style={{ color: 'var(--text-muted)' }}>Service Name</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Category</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-right" style={{ color: 'var(--text-muted)' }}>Base Price</th>
                            <th className="py-5 px-6 text-[10px] font-black uppercase tracking-widest text-center" style={{ color: 'var(--text-muted)' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.map((service) => (
                            <tr key={service.id}>
                                <td>
                                    <div className="service-cell">
                                        <Wrench size={20} />
                                        <span style={{ color: 'var(--text-main)' }}>{service.name}</span>
                                    </div>
                                </td>
                                <td className="text-center">
                                    <span className={`badge ${(service.category || 'general').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '-')}`}>
                                        {service.category || 'General'}
                                    </span>
                                </td>
                                <td className="text-right">
                                    <div className="price">
                                        <IndianRupee size={16} />
                                        {service.base_price.toLocaleString()}
                                    </div>
                                </td>
                                <td>
                                    <div className="flex items-center justify-center gap-2">
                                        <button
                                            onClick={() => onEdit(service)}
                                            className="action-btn"
                                            title="Edit Service"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(service.id)}
                                            className="action-btn hover:text-red-500 hover:border-red-200"
                                            title="Delete Service"
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
                        <Wrench size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No services found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', maxWidth: '320px', margin: '0 auto' }}>Try refining your search keywords or add a new service to the catalog.</p>
                </div>
            )}
        </div>
    );
}
