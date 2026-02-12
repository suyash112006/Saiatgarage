'use client';

import { updateCustomer } from '@/app/actions/customer';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Loader2, Save, User, Phone, MapPin, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface EditCustomerFormProps {
    customer: {
        id: number;
        name: string;
        mobile: string;
        address?: string;
    };
}

export default function EditCustomerForm({ customer }: EditCustomerFormProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

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
                router.push(`/dashboard/customers/${customer.id}`);
                router.refresh();
            }
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            setLoading(false);
        }
    }

    return (
        <div className="card form-card" style={{ maxWidth: '800px', padding: '40px', borderRadius: '24px' }}>
            <form onSubmit={handleSubmit}>
                {error && (
                    <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm mb-8 font-medium">
                        {error}
                    </div>
                )}

                <div className="mb-8">
                    <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs">
                        <User size={18} className="text-primary" />
                        Edit Customer Profile
                    </h3>

                    <div className="form-grid">
                        <div className="form-field">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Full Name *</label>
                            <div className="input-wrapper flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <User size={18} className="text-slate-400" />
                                <input
                                    name="name"
                                    defaultValue={customer.name}
                                    className="bg-transparent border-none outline-none w-full font-semibold text-slate-900 placeholder:text-slate-300"
                                    placeholder="e.g. John Doe"
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Mobile Number</label>
                            <div className="input-wrapper flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <Phone size={18} className="text-slate-400" />
                                <input
                                    type="tel"
                                    name="mobile"
                                    defaultValue={customer.mobile}
                                    placeholder="9876543210"
                                    className="bg-transparent border-none outline-none w-full font-semibold text-slate-900 placeholder:text-slate-300 font-mono"
                                />
                            </div>
                        </div>

                        <div className="form-field col-span-2">
                            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 block">Address</label>
                            <div className="input-wrapper flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl focus-within:ring-2 focus-within:ring-primary/20 transition-all">
                                <MapPin size={18} className="text-slate-400 mt-1.5" />
                                <textarea
                                    name="address"
                                    defaultValue={customer.address}
                                    rows={3}
                                    placeholder="Customer's billing address"
                                    className="bg-transparent border-none outline-none w-full font-medium text-slate-900 placeholder:text-slate-300 resize-none leading-relaxed py-0.5"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-actions pt-8 border-t border-slate-100 flex justify-end gap-3">
                    <Link
                        href={`/dashboard/customers/${customer.id}`}
                        className="btn btn-outline border-slate-200 hover:bg-slate-50 text-slate-600 font-bold px-6 py-3 rounded-xl flex items-center gap-2 transition-colors"
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        className="btn btn-primary shadow-lg shadow-primary/20 font-bold px-8 py-3 rounded-xl flex items-center gap-2"
                        disabled={loading}
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            <Save size={18} />
                        )}
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    );
}
