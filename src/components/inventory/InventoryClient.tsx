'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Wrench, Layers, Car } from 'lucide-react';
import { deleteMasterService, deleteMasterPart, deleteCarLibraryItem } from '@/app/actions/inventory';
import ServiceInventoryList from '@/components/inventory/ServiceInventoryList';
import PartInventoryList from '@/components/inventory/PartInventoryList';
import CarLibraryList from '@/components/inventory/CarLibraryList';
import InventoryModal from '@/components/inventory/InventoryModal';
import ManageCategoriesModal from '@/components/inventory/ManageCategoriesModal';

export default function InventoryClient({
    initialServices,
    initialParts,
    initialLibrary,
    initialBrands,
    initialCategories,
    initialTab
}: {
    initialServices: any[],
    initialParts: any[],
    initialLibrary: any[],
    initialBrands: any[],
    initialCategories: any[],
    initialTab: string
}) {
    const router = useRouter();
    const [tab, setTab] = useState(initialTab === 'library' ? 'parts' : initialTab);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<any>(null);

    // Local state for instant updates
    const [services, setServices] = useState(initialServices);
    const [parts, setParts] = useState(initialParts);
    const [carLibrary, setCarLibrary] = useState(initialLibrary);
    const [categories, setCategories] = useState(initialCategories || []);
    const [isManageCategoriesOpen, setIsManageCategoriesOpen] = useState(false);

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
                    const updated = exists 
                        ? prev.map(i => i.id === newItem.id ? newItem : i)
                        : [...prev, newItem];
                    return [...updated].sort((a, b) => a.name.localeCompare(b.name));
                });
            } else if (result.type === 'parts') {
                setParts(prev => {
                    const exists = prev.find(i => i.id === newItem.id);
                    const updated = exists 
                        ? prev.map(i => i.id === newItem.id ? newItem : i)
                        : [...prev, newItem];
                    return [...updated].sort((a, b) => a.name.localeCompare(b.name));
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

        if (res?.success) {
            if (type === 'services') setServices(prev => prev.filter(i => i.id !== id));
            else if (type === 'parts') setParts(prev => prev.filter(i => i.id !== id));
            else if (type === 'cars') setCarLibrary(prev => prev.filter(i => i.id !== id));
        } else if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <>
            <div className="flex justify-end mb-6 gap-3">
                {tab === 'parts' && (
                    <button
                        type="button"
                        onClick={() => setIsManageCategoriesOpen(true)}
                        className="btn flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
                        style={{ background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff', border: 'none' }}
                    >
                        <Layers size={18} />
                        MANAGE CATEGORIES
                    </button>
                )}
                <button
                    onClick={handleAddNew}
                    className="btn btn-primary flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:scale-[1.02] transition-all"
                >
                    <Plus size={18} />
                    NEW {tab === 'services' ? 'SERVICE' : tab === 'cars' ? 'VEHICLE' : 'PART'}
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
                    onClick={() => setTab('cars')}
                    className={`tab ${tab === 'cars' ? 'active' : ''}`}
                >
                    <Car size={16} />
                    Car Library
                </button>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {tab === 'services' && <ServiceInventoryList key="services" initialServices={services} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'services')} />}
                {tab === 'parts' && (
                    <PartInventoryList
                        initialParts={parts}
                        categories={categories}
                        onEdit={handleEdit}
                        onDelete={(id) => handleDelete(id, 'parts')}
                    />
                )}
                {tab === 'cars' && <CarLibraryList key="cars" initialLibrary={carLibrary} onEdit={handleEdit} onDelete={(id) => handleDelete(id, 'cars')} />}
            </div>

            {isModalOpen && (
                <InventoryModal
                    isOpen={isModalOpen}
                    onClose={() => handleModalClose()}
                    onSuccess={(data) => handleModalClose({ success: true, data, type: tab })}
                    type={tab === 'cars' ? 'cars' : tab as any}
                    initialData={editingItem}
                    brands={initialBrands}
                    categories={categories}
                />
            )}

            {isManageCategoriesOpen && (
                <ManageCategoriesModal 
                    categories={categories}
                    onClose={(res) => {
                        setIsManageCategoriesOpen(false);
                        if (res?.success) router.refresh();
                    }}
                />
            )}
        </>
    );
}
