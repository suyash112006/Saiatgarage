'use client';

import { useState } from 'react';
import { Plus, Wrench, Layers, ClipboardList } from 'lucide-react';
import ServiceInventoryList from '@/components/inventory/ServiceInventoryList';
import PartInventoryList from '@/components/inventory/PartInventoryList';
import PartLibraryList from '@/components/inventory/PartLibraryList';
import InventoryModal from '@/components/inventory/InventoryModal';

export default function InventoryClient({
    initialServices,
    initialParts,
    initialTab
}: {
    initialServices: any[],
    initialParts: any[],
    initialTab: string
}) {
    const [tab, setTab] = useState(initialTab);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    function handleAddNew() {
        setEditingItem(null);
        setIsModalOpen(true);
    }

    function handleEdit(item: any) {
        setEditingItem(item);
        setIsModalOpen(true);
    }

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="page-header">
                <div>
                    <nav className="breadcrumbs mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active">Inventory</span>
                    </nav>
                    <h1 className="page-title">Inventory</h1>
                    <p className="page-subtitle">Manage global services and parts inventory</p>
                </div>

                <button
                    onClick={handleAddNew}
                    className="btn btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    <Plus size={18} />
                    NEW {tab === 'services' ? 'SERVICE' : 'PART'}
                </button>
            </div>

            {/* Tab Navigation */}
            <div className="catalog-tabs">
                <button
                    onClick={() => setTab('services')}
                    className={`tab ${tab === 'services' ? 'active' : ''}`}
                >
                    <Wrench size={16} />
                    Services Catalog
                </button>
                <button
                    onClick={() => setTab('parts')}
                    className={`tab ${tab === 'parts' ? 'active' : ''}`}
                >
                    <Layers size={16} />
                    Parts Inventory
                </button>
                <button
                    onClick={() => setTab('library')}
                    className={`tab ${tab === 'library' ? 'active' : ''}`}
                >
                    <ClipboardList size={16} />
                    Part Library
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {tab === 'services' && <ServiceInventoryList initialServices={initialServices} onEdit={handleEdit} />}
                {tab === 'parts' && <PartInventoryList initialParts={initialParts} onEdit={handleEdit} />}
                {tab === 'library' && <PartLibraryList initialParts={initialParts} onEdit={handleEdit} />}
            </div>

            <InventoryModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={tab === 'library' ? 'parts' : tab as 'services' | 'parts'}
                initialData={editingItem}
            />
        </div>
    );
}
