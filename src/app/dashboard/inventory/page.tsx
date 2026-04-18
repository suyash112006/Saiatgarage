import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import InventoryWrapper from '@/components/inventory/InventoryWrapper';

export default async function InventoryPage(props: { searchParams: Promise<{ tab?: string }> }) {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const { tab = 'services' } = await props.searchParams;

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <nav className="breadcrumbs">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">Inventory</span>
                    </nav>
                    <h1 className="page-title">Inventory</h1>
                    <p className="page-subtitle text-muted">Manage global services and parts inventory</p>
                </div>
            </div>

            <Suspense fallback={<div className="p-10 text-center text-muted">Loading inventory data...</div>}>
                <InventoryWrapper tab={tab} />
            </Suspense>
        </div>
    );
}
