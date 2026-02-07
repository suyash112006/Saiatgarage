import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { getMasterServices, getMasterParts } from '@/app/actions/job';
import InventoryClient from '@/components/inventory/InventoryClient';

export const dynamic = 'force-dynamic';

export default async function InventoryPage(props: { searchParams: Promise<{ tab?: string }> }) {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    const { tab = 'services' } = await props.searchParams;
    const services = await getMasterServices();
    const parts = await getMasterParts();

    return (
        <div className="dashboard-container">
            <InventoryClient
                initialServices={services}
                initialParts={parts}
                initialTab={tab}
            />
        </div>
    );
}
