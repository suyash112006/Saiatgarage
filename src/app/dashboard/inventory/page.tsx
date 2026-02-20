import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import InventoryWrapper from '@/components/inventory/InventoryWrapper';

export const dynamic = 'force-dynamic';

export default async function InventoryPage(props: { searchParams: Promise<{ tab?: string }> }) {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const { tab = 'services' } = await props.searchParams;

    return (
        <div className="dashboard-container">
            <Suspense fallback={<div className="p-10 text-center text-muted">Loading inventory data...</div>}>
                <InventoryWrapper tab={tab} />
            </Suspense>
        </div>
    );
}
