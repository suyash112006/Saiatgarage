import { getSession } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import TrashWrapper from '@/components/TrashWrapper';

export const dynamic = 'force-dynamic';

export default async function TrashPage() {
    const session = await getSession();
    if (session?.role !== 'admin') {
        redirect('/dashboard');
    }

    return (
        <div className="dashboard-container">
            <div className="page-header mb-8">
                <div>
                    <nav className="breadcrumbs">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">Trash</span>
                    </nav>
                    <h1 className="page-title">Trash</h1>
                    <p className="page-subtitle text-muted">Restore deleted items</p>
                </div>
            </div>

            <Suspense fallback={<div className="p-10 text-center text-muted">Loading trash...</div>}>
                <TrashWrapper />
            </Suspense>
        </div>
    );
}
