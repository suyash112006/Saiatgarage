'use client';

import { updateCustomer } from '@/app/actions/customer';
import { useState, useRef, useEffect } from 'react';
import { Pencil, Save, User, Phone, MapPin, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditCustomerModalProps {
    customer: {
        id: number;
        name: string;
        mobile: string;
        address?: string;
    };
}

export default function EditCustomerModal({ customer }: EditCustomerModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    function handleClose() {
        setIsOpen(false);
        setError('');
    }

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

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);
        const data = {
            id: customer.id,
            name: formData.get('name') as string,
            mobile: formData.get('mobile') as string,
            address: formData.get('address') as string,
        };

        try {
            const result = await updateCustomer(data);
            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else {
                handleClose();
                router.refresh();
            }
        } catch {
            setError('Failed to update profile. Please try again.');
            setLoading(false);
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="btn btn-outline border-slate-200 shadow-sm rounded-xl px-4 py-2 hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm font-bold"
            >
                <Pencil size={18} />
                Edit Profile
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md" ref={modalRef}>
                        <div className="modal-header">
                            <div className="modal-header-left">
                                <div className="card-icon">
                                    <User size={18} />
                                </div>
                                <div>
                                    <h3>Edit Profile</h3>
                                    <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Update customer information</p>
                                </div>
                            </div>
                            <button onClick={handleClose} type="button" className="icon-btn">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-xs font-medium flex items-center gap-2">
                                        <X size={14} />{error}
                                    </div>
                                )}

                                <div className="form-field">
                                    <label>Full Name *</label>
                                    <div className="input-wrapper">
                                        <User size={16} />
                                        <input
                                            name="name"
                                            defaultValue={customer.name}
                                            placeholder="e.g. John Doe"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Mobile Number</label>
                                    <div className="input-wrapper">
                                        <Phone size={16} />
                                        <input
                                            type="tel"
                                            name="mobile"
                                            defaultValue={customer.mobile}
                                            placeholder="9876543210"
                                            className="font-mono"
                                        />
                                    </div>
                                </div>

                                <div className="form-field">
                                    <label>Address</label>
                                    <div className="input-wrapper items-start">
                                        <MapPin size={16} style={{ position: 'absolute', top: '15px', left: '12px', zIndex: 10 }} />
                                        <textarea
                                            name="address"
                                            defaultValue={customer.address}
                                            rows={3}
                                            placeholder="Customer's billing address"
                                            className="w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" onClick={handleClose} className="btn btn-outline">
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : <Save className="mr-2" size={18} />}
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
