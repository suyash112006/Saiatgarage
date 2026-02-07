'use client';

import { createVehicle } from '@/app/actions/vehicle';
import { useState } from 'react';
import { Plus, Save, Car, X, Loader2, Clock } from 'lucide-react';

export default function AddVehicleForm({ customerId }: { customerId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    function handleClose() {
        setIsOpen(false);
        setError('');
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        formData.append('customerId', customerId.toString());

        const result = await createVehicle(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setLoading(false);
            setIsOpen(false);
            (event.target as HTMLFormElement).reset();
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
        <div className="card p-0 rounded-2xl shadow-xl shadow-slate-200/50 border-slate-200 bg-white mb-8 overflow-hidden animate-in slide-in-from-top-4 duration-300">
            <div className="modal-header">
                <div className="modal-header-left">
                    <div className="card-icon">
                        <Car size={18} />
                    </div>
                    <div>
                        <h3>Add New Vehicle</h3>
                        <p className="text-xs text-slate-500 mt-1">Register a new vehicle for this customer</p>
                    </div>
                </div>
                <button onClick={handleClose} className="icon-btn">
                    <X size={18} />
                </button>
            </div>

            <div className="p-6">

                <form onSubmit={handleSubmit}>
                    {error && <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs mb-6 font-medium">{error}</div>}

                    <div className="form-grid">
                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Vehicle Number *</label>
                            <div className="input-wrapper">
                                <input
                                    type="text"
                                    name="vehicleNumber"
                                    placeholder="MH 12 AB 1234"
                                    required
                                    className="bg-slate-50 font-mono uppercase font-black"
                                    onChange={(e) => {
                                        const val = e.target.value.toUpperCase();
                                        e.target.value = val;
                                    }}
                                />
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Model *</label>
                            <div className="input-wrapper">
                                <input type="text" name="model" placeholder="Honda City i-VTEC" className="bg-slate-50" required />
                            </div>
                        </div>
                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Current KM Reading</label>
                            <div className="input-wrapper">
                                <Clock size={16} />
                                <input type="number" name="lastKm" placeholder="e.g. 45000" className="bg-slate-50" />
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer flex justify-end gap-3 pt-6 border-t border-slate-100">
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
