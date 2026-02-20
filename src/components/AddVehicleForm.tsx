'use client';

import { createVehicle } from '@/app/actions/vehicle';
import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Save, Car, X, Loader2, Clock, Hash, Tag, ChevronDown } from 'lucide-react';

interface CarLibraryItem {
    brand: string;
    model: string;
}

export default function AddVehicleForm({ customerId, carLibrary = [] }: { customerId: string, carLibrary?: CarLibraryItem[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [selectedBrand, setSelectedBrand] = useState('');
    const [selectedModel, setSelectedModel] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;
        function handleOutsideClick(e: MouseEvent) {
            if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
                handleClose();
            }
        }
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [isOpen]);

    const brands = useMemo(() => {
        return Array.from(new Set(carLibrary.map(item => item.brand))).sort();
    }, [carLibrary]);

    const availableModels = useMemo(() => {
        if (!selectedBrand) return [];
        return carLibrary
            .filter(item => item.brand === selectedBrand)
            .map(item => item.model)
            .sort();
    }, [selectedBrand, carLibrary]);

    function handleClose() {
        setIsOpen(false);
        setError('');
        setSelectedBrand('');
        setSelectedModel('');
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        formData.append('customerId', customerId.toString());

        // Use the selected brand/model to form the final model string if they chose from dropdowns
        if (selectedBrand && selectedModel) {
            formData.set('model', `${selectedBrand} ${selectedModel}`);
        }

        const result = await createVehicle(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setLoading(false);
            setIsOpen(false);
            (event.target as HTMLFormElement).reset();
            setSelectedBrand('');
            setSelectedModel('');
        }
    }

    if (!isOpen) {
        return (
            <button onClick={() => setIsOpen(true)} className="btn btn-primary text-xs px-4 py-2 rounded-xl shadow-lg shadow-primary/10">
                <Plus size={16} className="mr-2" />
                Add Vehicle
            </button>
        );
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content max-w-md" ref={modalRef}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <Car size={18} />
                        </div>
                        <div>
                            <h3>Add New Vehicle</h3>
                            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Register a new vehicle for this customer</p>
                        </div>
                    </div>
                    <button onClick={handleClose} type="button" className="icon-btn" style={{ color: 'var(--text-muted)' }}>
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4">
                        {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2"><X size={14} />{error}</div>}

                        <div className="form-field">
                            <label>Vehicle Number *</label>
                            <div className="input-wrapper">
                                <Hash size={16} />
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    placeholder="e.g. MH 12 AB 1234"
                                    required
                                    className="font-mono uppercase font-black"
                                    onChange={(e) => { e.target.value = e.target.value.toUpperCase(); }}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>VIN Number</label>
                            <div className="input-wrapper">
                                <Hash size={16} />
                                <input
                                    type="text"
                                    name="vin"
                                    placeholder="17 Digit VIN"
                                    className="font-mono text-[13px]"
                                    maxLength={17}
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Brand *</label>
                            <div className="input-wrapper relative">
                                <Tag size={16} />
                                <select
                                    value={selectedBrand}
                                    onChange={(e) => { setSelectedBrand(e.target.value); setSelectedModel(''); }}
                                    required
                                    className="appearance-none flex-1 pr-8 outline-none"
                                >
                                    <option value="">Select Brand</option>
                                    {brands.map(b => (
                                        <option key={b} value={b}>{b}</option>
                                    ))}
                                    <option value="Other">Custom Brand</option>
                                </select>
                                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Model *</label>
                            <div className="input-wrapper relative">
                                <Car size={16} />
                                {selectedBrand === 'Other' ? (
                                    <input
                                        type="text"
                                        name="model"
                                        placeholder="Type Model Name"
                                        required
                                    />
                                ) : (
                                    <>
                                        <select
                                            value={selectedModel}
                                            onChange={(e) => setSelectedModel(e.target.value)}
                                            disabled={!selectedBrand}
                                            required
                                            className="appearance-none flex-1 pr-8 outline-none disabled:opacity-50"
                                        >
                                            <option value="">{selectedBrand ? 'Select Model' : 'Choose Brand First'}</option>
                                            {availableModels.map(m => (
                                                <option key={m} value={m}>{m}</option>
                                            ))}
                                        </select>
                                        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </>
                                )}
                            </div>
                        </div>

                        <div className="form-field">
                            <label>Current KM Reading</label>
                            <div className="input-wrapper">
                                <Clock size={16} />
                                <input type="number" name="lastKm" placeholder="e.g. 45000" />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" onClick={handleClose} className="btn btn-outline">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Plus className="mr-2" size={18} />}
                            Save Vehicle
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
