'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save, Wrench, Layers, Hash, IndianRupee, Tag, Car, ChevronRight, Plus } from 'lucide-react';
import {
    addMasterService, updateMasterService,
    addMasterPart, updateMasterPart,
    addCarLibraryItem, updateCarLibraryItem,
    addPartLibraryItem, updatePartLibraryItem
} from '@/app/actions/inventory';

export default function InventoryModal({
    isOpen,
    onClose,
    type,
    initialData,
    brands = []
}: {
    isOpen: boolean,
    onClose: () => void,
    type: 'services' | 'parts' | 'cars' | 'part_library',
    initialData?: any,
    brands?: any[]
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [unitPrice, setUnitPrice] = useState(0);
    const [stockQuantity, setStockQuantity] = useState(0);

    // Initialize state when initialData changes or modal opens
    useEffect(() => {
        if (initialData && (type === 'parts' || type === 'part_library')) {
            setUnitPrice(initialData.unit_price || 0);
            if (type === 'parts') {
                setStockQuantity(initialData.stock_quantity || 0);
            }
        } else {
            setUnitPrice(0);
            setStockQuantity(0);
        }
    }, [initialData, isOpen, type]);

    if (!isOpen) return null;

    const isEdit = !!initialData;

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        if (isEdit) formData.append('id', initialData.id);

        let res;
        if (type === 'services') {
            res = isEdit ? await updateMasterService(formData) : await addMasterService(formData);
        } else if (type === 'parts') {
            res = isEdit ? await updateMasterPart(formData) : await addMasterPart(formData);
        } else if (type === 'cars') {
            res = isEdit ? await updateCarLibraryItem(formData) : await addCarLibraryItem(formData);
        } else if (type === 'part_library') {
            res = isEdit ? await updatePartLibraryItem(formData) : await addPartLibraryItem(formData);
        }

        setLoading(false);
        if (res?.success) {
            onClose();
        } else {
            setError(res?.error || 'Failed to save item');
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            {type === 'services' ? <Wrench size={18} /> :
                                type === 'cars' ? <Car size={18} /> :
                                    <Layers size={18} />}
                        </div>
                        <div>
                            <h3 style={{ color: 'var(--text-main)', fontSize: '18px', fontWeight: 700 }}>{isEdit ? 'Edit' : 'Add New'} {
                                type === 'services' ? 'Service' :
                                    type === 'cars' ? 'Vehicle' :
                                        type === 'part_library' ? 'Library Part' : 'Inventory Part'
                            }</h3>
                            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>Master catalog management</p>
                        </div>
                    </div>
                    <button onClick={onClose} type="button" className="icon-btn" style={{ color: 'var(--text-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 mb-4" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                            <X size={14} /> {error}
                        </div>
                    )}

                    {type === 'cars' ? (
                        <>
                            <div className="form-field">
                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Vehicle Brand</label>
                                <div className="input-wrapper">
                                    <Tag size={16} />
                                    <input
                                        name="brand"
                                        type="text"
                                        list="vehicle-brands"
                                        defaultValue={initialData?.brand}
                                        placeholder="Select or type brand (e.g. BMW, Toyota)"
                                        required
                                    />
                                    <datalist id="vehicle-brands">
                                        {brands.map((b: any) => (
                                            <option key={b.id} value={b.name} />
                                        ))}
                                    </datalist>
                                </div>
                            </div>
                            <div className="form-field">
                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>
                                    Vehicle Model{!isEdit && 's'}
                                </label>
                                <div className="input-wrapper items-start">
                                    <Car size={16} style={{ position: 'absolute', top: '15px', left: '12px', zIndex: 10 }} />
                                    {isEdit ? (
                                        <input
                                            name="model"
                                            type="text"
                                            defaultValue={initialData?.model}
                                            placeholder="e.g. Swift, Fortuner"
                                            required
                                        />
                                    ) : (
                                        <textarea
                                            name="model"
                                            placeholder="e.g. Swift, Dzire, Baleno"
                                            required
                                            rows={3}
                                            className="w-full"
                                        />
                                    )}
                                </div>
                                {!isEdit && (
                                    <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontStyle: 'italic', marginLeft: '40px' }}>
                                        (Tip: Separate multiple models with commas)
                                    </p>
                                )}
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-field">
                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Item Name</label>
                                <div className="input-wrapper">
                                    <input
                                        name="name"
                                        type="text"
                                        defaultValue={initialData?.name}
                                        placeholder={type === 'services' ? 'e.g. Full Synthetic Oil Change' : 'e.g. Engine Oil (5L)'}
                                        required
                                    />
                                </div>
                            </div>

                            {type === 'services' ? (
                                <>
                                    <div className="form-field">
                                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Category</label>
                                        <div className="input-wrapper">
                                            <select
                                                name="category"
                                                defaultValue={initialData?.category || 'General'}
                                            >
                                                <option value="General">General</option>
                                                <option value="Electrical">Electrical</option>
                                                <option value="Body Work">Body Work</option>
                                                <option value="Engine">Engine</option>
                                                <option value="AC / Heating">AC / Heating</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Base Price</label>
                                        <div className="input-wrapper">
                                            <IndianRupee size={16} />
                                            <input
                                                name="basePrice"
                                                type="number"
                                                defaultValue={initialData?.base_price}
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="form-field">
                                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Part Number / ID</label>
                                        <div className="input-wrapper">
                                            <Hash size={16} />
                                            <input
                                                name="partNo"
                                                type="text"
                                                defaultValue={initialData?.part_no}
                                                placeholder="e.g. OIL-001"
                                                disabled={isEdit && type === 'parts'}
                                                className="font-mono"
                                            />
                                        </div>
                                        {isEdit && type === 'parts' && <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '12px' }}>Fixed identifier</p>}
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="form-field">
                                            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Brand</label>
                                            <div className="input-wrapper">
                                                <Tag size={16} />
                                                <input
                                                    name="brand"
                                                    type="text"
                                                    defaultValue={initialData?.brand}
                                                    placeholder="e.g. Bosch"
                                                />
                                            </div>
                                        </div>
                                        <div className="form-field">
                                            <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Compatibility</label>
                                            <div className="input-wrapper">
                                                <Wrench size={16} />
                                                <input
                                                    name="compatibility"
                                                    type="text"
                                                    defaultValue={initialData?.compatibility}
                                                    placeholder="e.g. Universal / Sedan"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="form-field">
                                        <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Unit Price</label>
                                        <div className="input-wrapper">
                                            <IndianRupee size={16} />
                                            <input
                                                name="unitPrice"
                                                type="number"
                                                value={unitPrice}
                                                onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                                                placeholder="2800"
                                            />
                                        </div>
                                    </div>
                                    {type === 'parts' && (
                                        <>
                                            <div className="form-field">
                                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Initial Stock</label>
                                                <div className="input-wrapper">
                                                    <Tag size={16} />
                                                    <input
                                                        name="stockQuantity"
                                                        type="number"
                                                        value={stockQuantity}
                                                        onChange={(e) => setStockQuantity(Number(e.target.value) || 0)}
                                                        placeholder="50"
                                                    />
                                                </div>
                                            </div>
                                            <div className="form-field">
                                                <label style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '8px', display: 'block' }}>Auto Total (Read Only)</label>
                                                <div className="readonly-box tabular-nums">
                                                    <IndianRupee size={16} />
                                                    <span className="font-black text-lg">
                                                        ₹{(unitPrice * stockQuantity).toLocaleString()}
                                                    </span>
                                                </div>
                                                <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginLeft: '12px' }}>Computed: Price × Quantity</p>
                                            </div>
                                        </>
                                    )}
                                </>
                            )}
                        </>
                    )}

                    <div className="modal-footer">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ minWidth: '160px' }}
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> :
                                isEdit ? <Save size={18} className="mr-2" /> : <Plus size={18} className="mr-2" />}
                            {isEdit ? 'Update' : 'Save'} {
                                type === 'services' ? 'Service' :
                                    type === 'cars' ? 'Vehicle' :
                                        type === 'part_library' ? 'Library Part' : 'Inventory Part'
                            }
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
