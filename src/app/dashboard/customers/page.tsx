import Link from 'next/link';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import { Suspense } from 'react';
import CustomerTableWrapper from '@/components/CustomerTableWrapper';

export default async function CustomersPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const isAdmin = session?.role === 'admin';

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <nav className="breadcrumbs">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator">/</span>
                        <span className="breadcrumb-item active">Customers</span>
                    </nav>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle text-muted">Manage your client base and their vehicles</p>
                </div>

                <Link href="/dashboard/customers/add" className="btn btn-primary">
                    <Plus size={18} className="mr-2" />
                    Add Customer
                </Link>
            </div>

            <Suspense fallback={<div className="p-10 text-center text-muted">Loading customers...</div>}>
                <CustomerTableWrapper isAdmin={isAdmin} />
            </Suspense>
        </div>
    );
}
