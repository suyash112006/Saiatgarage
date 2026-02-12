'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, Save, Wrench, Layers, Hash, IndianRupee, Tag, ClipboardList, Info } from 'lucide-react';
import { addMasterService, updateMasterService, addMasterPart, updateMasterPart } from '@/app/actions/inventory';

export default function InventoryModal({
    isOpen,
    onClose,
    type,
    initialData
}: {
    isOpen: boolean,
    onClose: () => void,
    type: 'services' | 'parts',
    initialData?: any
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [unitPrice, setUnitPrice] = useState(0);
    const [stockQuantity, setStockQuantity] = useState(0);

    // Initialize state when initialData changes or modal opens
    useEffect(() => {
        if (initialData) {
            setUnitPrice(initialData.unit_price || 0);
            setStockQuantity(initialData.stock_quantity || 0);
        } else {
            setUnitPrice(0);
            setStockQuantity(0);
        }
    }, [initialData, isOpen]);

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
        } else {
            res = isEdit ? await updateMasterPart(formData) : await addMasterPart(formData);
        }

        setLoading(false);
        if (res.success) {
            onClose();
        } else {
            setError(res.error || 'Failed to save item');
        }
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            {type === 'services' ? <Wrench size={18} /> : <Layers size={18} />}
                        </div>
                        <div>
                            <h3>{isEdit ? 'Edit' : 'Add New'} {type === 'services' ? 'Service' : 'Part'}</h3>
                            <p className="text-xs text-slate-500 mt-1">Master catalog management</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="icon-btn">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="modal-body space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm font-medium border border-red-100 flex items-center gap-2 mb-4">
                            <X size={14} /> {error}
                        </div>
                    )}

                    <div className="form-field">
                        <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Item Name</label>
                        <div className="input-wrapper">
                            <input
                                name="name"
                                type="text"
                                defaultValue={initialData?.name}
                                placeholder={type === 'services' ? 'e.g. Full Synthetic Oil Change' : 'e.g. Engine Oil (5L)'}
                                required
                                className="bg-slate-50"
                            />
                        </div>
                    </div>

                    {type === 'services' ? (
                        <>
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Category</label>
                                <div className="input-wrapper">
                                    <select
                                        name="category"
                                        defaultValue={initialData?.category || 'General'}
                                        className="bg-slate-50"
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
                                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Base Price</label>
                                <div className="input-wrapper">
                                    <IndianRupee size={16} />
                                    <input
                                        name="basePrice"
                                        type="number"
                                        defaultValue={initialData?.base_price}
                                        placeholder="0"
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Part Number / ID</label>
                                <div className="input-wrapper">
                                    <Hash size={16} />
                                    <input
                                        name="partNo"
                                        type="text"
                                        defaultValue={initialData?.part_no}
                                        placeholder="e.g. OIL-001"
                                        disabled={isEdit}
                                        className="bg-slate-50 font-mono"
                                    />
                                </div>
                                {isEdit && <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-bold uppercase tracking-wider">Fixed identifier</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="form-field">
                                    <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Brand</label>
                                    <div className="input-wrapper">
                                        <Tag size={16} />
                                        <input
                                            name="brand"
                                            type="text"
                                            defaultValue={initialData?.brand}
                                            placeholder="e.g. Bosch"
                                            className="bg-slate-50"
                                        />
                                    </div>
                                </div>
                                <div className="form-field">
                                    <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Compatibility</label>
                                    <div className="input-wrapper">
                                        <Wrench size={16} />
                                        <input
                                            name="compatibility"
                                            type="text"
                                            defaultValue={initialData?.compatibility}
                                            placeholder="e.g. Universal / Sedan"
                                            className="bg-slate-50"
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Unit Price</label>
                                <div className="input-wrapper">
                                    <IndianRupee size={16} />
                                    <input
                                        name="unitPrice"
                                        type="number"
                                        value={unitPrice}
                                        onChange={(e) => setUnitPrice(Number(e.target.value) || 0)}
                                        placeholder="2800"
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Initial Stock</label>
                                <div className="input-wrapper">
                                    <Tag size={16} />
                                    <input
                                        name="stockQuantity"
                                        type="number"
                                        value={stockQuantity}
                                        onChange={(e) => setStockQuantity(Number(e.target.value) || 0)}
                                        placeholder="50"
                                        className="bg-slate-50"
                                    />
                                </div>
                            </div>
                            <div className="form-field">
                                <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Auto Total (Read Only)</label>
                                <div className="input-wrapper bg-slate-100/50">
                                    <IndianRupee size={16} className="text-slate-400" />
                                    <div className="p-3 text-sm font-black text-slate-900">
                                        ₹{(unitPrice * stockQuantity).toLocaleString()}
                                    </div>
                                </div>
                                <p className="text-[10px] text-slate-400 mt-1.5 ml-1 font-bold uppercase tracking-wider">Computed: Price × Quantity</p>
                            </div>
                        </>
                    )}

                    <div className="modal-footer flex justify-end gap-3 pt-6 border-t border-slate-100">
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
                        >
                            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save size={18} className="mr-2" />}
                            {isEdit ? 'Update' : 'Save'} {type === 'services' ? 'Service' : 'Part'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
