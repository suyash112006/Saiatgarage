'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wrench, Layers, Car } from 'lucide-react';
import ServiceInventoryList from '@/components/inventory/ServiceInventoryList';
import PartInventoryList from '@/components/inventory/PartInventoryList';
import PartLibraryList from '@/components/inventory/PartLibraryList';
import CarLibraryList from '@/components/inventory/CarLibraryList';
import InventoryModal from '@/components/inventory/InventoryModal';

export default function InventoryClient({
    initialServices,
    initialParts,
    initialPartLibrary,
    initialLibrary,
    initialBrands,
    initialTab
}: {
    initialServices: any[],
    initialParts: any[],
    initialPartLibrary: any[],
    initialLibrary: any[],
    initialBrands: any[],
    initialTab: string
}) {
    const router = useRouter();
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

    function handleModalClose() {
        setIsModalOpen(false);
        router.refresh();
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
                    <h1 className="page-title flex items-center gap-3">
                        <Layers className="text-primary" size={28} />
                        Inventory
                    </h1>
                    <p className="page-subtitle">Manage global services and parts inventory</p>
                </div>

                <button
                    onClick={handleAddNew}
                    className="btn btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    <Plus size={18} />
                    NEW {tab === 'services' ? 'SERVICE' : tab === 'cars' ? 'VEHICLE' : tab === 'library' ? 'LIBRARY PART' : 'PART'}
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
                    <Layers size={16} />
                    Part Library
                </button>
                <button
                    onClick={() => setTab('cars')}
                    className={`tab ${tab === 'cars' ? 'active' : ''}`}
                >
                    <Car size={16} />
                    Car Library
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {tab === 'services' && <ServiceInventoryList initialServices={initialServices} onEdit={handleEdit} />}
                {tab === 'parts' && <PartInventoryList initialParts={initialParts} onEdit={handleEdit} />}
                {tab === 'library' && <PartLibraryList libraryParts={initialPartLibrary} onEdit={handleEdit} />}
                {tab === 'cars' && <CarLibraryList initialLibrary={initialLibrary} onEdit={handleEdit} />}
            </div>

            <InventoryModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                type={tab === 'library' ? 'part_library' : tab === 'cars' ? 'cars' : tab as any}
                initialData={editingItem}
                brands={initialBrands}
            />
        </div>
    );
}
