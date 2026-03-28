'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wrench, Layers, Car } from 'lucide-react';
import { deleteMasterService, deleteMasterPart, deleteCarLibraryItem, deletePartLibraryItem } from '@/app/actions/inventory';
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

    // Local state for instant updates
    const [services, setServices] = useState(initialServices);
    const [parts, setParts] = useState(initialParts);
    const [partLibrary, setPartLibrary] = useState(initialPartLibrary);
    const [carLibrary, setCarLibrary] = useState(initialLibrary);

    function handleAddNew() {
        setEditingItem(null);
        setIsModalOpen(true);
    }

    function handleEdit(item: any) {
        setEditingItem(item);
        setIsModalOpen(true);
    }

    function handleModalClose(result?: { success: boolean, data?: any, type: string }) {
        setIsModalOpen(false);
        setEditingItem(null);

        if (result?.success && result.data) {
            const newItem = result.data;
            if (result.type === 'services') {
                setServices(prev => {
                    const exists = prev.find(i => i.id === newItem.id);
                    if (exists) return prev.map(i => i.id === newItem.id ? newItem : i);
                    return [newItem, ...prev];
                });
            } else if (result.type === 'parts') {
                setParts(prev => {
                    const exists = prev.find(i => i.id === newItem.id);
                    if (exists) return prev.map(i => i.id === newItem.id ? newItem : i);
                    return [newItem, ...prev];
                });
            } else if (result.type === 'part_library') {
                setPartLibrary(prev => {
                    const exists = prev.find(i => i.id === newItem.id);
                    if (exists) return prev.map(i => i.id === newItem.id ? newItem : i);
                    return [newItem, ...prev];
                });
            }
        } else if (result?.success) {
            // Fallback for types that don't return specific data yet (like car library)
            router.refresh();
        }
    }

    async function handleDelete(id: number, type: string) {
        if (!confirm(`Are you sure you want to delete this ${type.slice(0, -1)}?`)) return;

        let res;
        if (type === 'services') res = await deleteMasterService(id);
        else if (type === 'parts') res = await deleteMasterPart(id);
        else if (type === 'cars') res = await deleteCarLibraryItem(id);
        else if (type === 'library') res = await deletePartLibraryItem(id);

        if (res?.success) {
            if (type === 'services') setServices(prev => prev.filter(i => i.id !== id));
            else if (type === 'parts') setParts(prev => prev.filter(i => i.id !== id));
            else if (type === 'library') setPartLibrary(prev => prev.filter(i => i.id !== id));
            else if (type === 'cars') setCarLibrary(prev => prev.filter(i => i.id !== id));
        } else if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <>
            <div className="flex justify-end mb-6">
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
                {tab === 'services' && <ServiceInventoryList key="services" initialServices={services} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'services')} />}
                {tab === 'parts' && <PartInventoryList key="parts" initialParts={parts} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'parts')} />}
                {tab === 'library' && <PartLibraryList key="library" libraryParts={partLibrary} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'library')} />}
                {tab === 'cars' && <CarLibraryList key="cars" initialLibrary={carLibrary} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'cars')} />}
            </div>

            <InventoryModal
                isOpen={isModalOpen}
                onClose={() => handleModalClose()}
                onSuccess={(data) => handleModalClose({ success: true, data, type: tab === 'library' ? 'part_library' : tab })}
                type={tab === 'library' ? 'part_library' : tab === 'cars' ? 'cars' : tab as any}
                initialData={editingItem}
                brands={initialBrands}
            />
        </>
    );
}
