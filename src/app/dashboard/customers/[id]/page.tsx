import { Suspense } from 'react';
import CustomerViewWrapper from '@/components/CustomerViewWrapper';
import Link from 'next/link';

type Params = Promise<{ id: string }>;

export default async function CustomerDetailPage(props: { params: Params }) {
    const params = await props.params;

    return (
        <div className="dashboard-container">
            <nav className="breadcrumbs" style={{ color: 'var(--text-muted)' }}>
                <Link href="/dashboard" className="breadcrumb-item" style={{ color: 'var(--text-muted)' }}>Dashboard</Link>
                <span className="breadcrumb-separator" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/</span>
                <Link href="/dashboard/customers" className="breadcrumb-item" style={{ color: 'var(--text-muted)' }}>Customers</Link>
                <span className="breadcrumb-separator" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>/</span>
                <span className="breadcrumb-item active" style={{ color: 'var(--primary)' }}>#{params.id.toString().padStart(4, '0')}</span>
            </nav>

            <Suspense fallback={<div className="p-10 text-center text-muted">Loading customer details...</div>}>
                <CustomerViewWrapper customerId={params.id} />
            </Suspense>
        </div>
    );
}

function CheckCircle({ size, className }: { size: number, className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
