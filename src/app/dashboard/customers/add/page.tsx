'use client';

import { createCustomer } from '@/app/actions/customer';
import Link from 'next/link';
import {
    Save,
    User,
    Phone,
    MapPin,
    Loader2,
    Car,
    Hash,
    Settings,
    ClipboardList,
    FileText,
    Clock
} from 'lucide-react';
import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function AddCustomerForm() {
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();
    const prefilledMobile = searchParams.get('mobile') || '';

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(event.currentTarget);

        try {
            const result = await createCustomer(formData) as any;

            if (result.error) {
                setError(result.error);
                setLoading(false);
            } else if (result.success && result.customerId) {
                router.push(`/dashboard/customers/${result.customerId}`);
            } else {
                setError('Could not create Customer profile. Please check your inputs.');
                setLoading(false);
            }
        } catch (err: any) {
            setError('Server connection error. Please try again later.');
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit}>
            {error && <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm mb-8 font-medium">{error}</div>}

            {/* Section 1: Customer Details */}
            <div className="mb-8">
                <h3 className="section-title text-slate-900 flex items-center gap-2 mb-6 font-bold uppercase tracking-wider text-xs">
                    <User size={18} className="text-primary" />
                    Customer Profile
                </h3>
                <div className="form-grid">
                    <div className="form-field">
                        <label>Full Name *</label>
                        <div className="input-wrapper">
                            <User size={16} />
                            <input name="name" placeholder="e.g. John Doe" required autoFocus />
                        </div>
                    </div>

                    <div className="form-field">
                        <label>Mobile Number</label>
                        <div className="input-wrapper">
                            <Phone size={16} />
                            <input
                                type="tel"
                                name="mobile"
                                defaultValue={prefilledMobile}
                                placeholder="9876543210"
                            />
                        </div>
                    </div>

                    <div className="form-field full">
                        <label>Address</label>
                        <div className="input-wrapper">
                            <MapPin size={16} />
                            <textarea name="address" rows={3} placeholder="Customer's billing address" style={{ height: 'auto', paddingTop: '12px' }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="form-actions pt-8 border-t border-slate-100 flex justify-end gap-3">
                <Link href="/dashboard" className="btn btn-outline border-slate-200" style={{ borderRadius: '16px', padding: '12px 28px' }}>
                    Cancel
                </Link>
                <button type="submit" className="btn btn-primary shadow-lg shadow-primary/20" disabled={loading} style={{ borderRadius: '16px', padding: '12px 32px', fontWeight: 600 }}>
                    {loading ? (
                        <Loader2 className="animate-spin mr-2" size={18} />
                    ) : (
                        <Save className="mr-2" size={18} />
                    )}
                    Save & Add Vehicle
                </button>
            </div>
        </form>
    );
}

export default function AddCustomerPage() {
    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <nav className="breadcrumbs text-muted mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item text-slate-400">Customers</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">New Entry</span>
                    </nav>

                    <h1 className="page-title">New Entry</h1>
                    <p className="page-subtitle text-muted">
                        Create customer profile, register vehicle, and open a job card
                    </p>
                </div>

                <Link href="/dashboard/customers" className="btn btn-outline shadow-sm border-slate-200">
                    Back to List
                </Link>
            </div>

            <div className="card form-card" style={{ maxWidth: '1000px', padding: '40px', borderRadius: '24px' }}>
                <Suspense fallback={<div>Loading...</div>}>
                    <AddCustomerForm />
                </Suspense>
            </div>
        </div>
    );
}
