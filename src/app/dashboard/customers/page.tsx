import { getCustomers } from '@/app/actions/customer';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { redirect } from 'next/navigation';
import { getSession } from '@/app/actions/auth';
import CustomerTable from '@/components/CustomerTable';

export default async function CustomersPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const customers = await getCustomers();

    return (
        <div className="dashboard-container">
            <div className="page-header">
                <div>
                    <nav className="breadcrumbs text-muted mb-1">
                        <span className="breadcrumb-item">Dashboard</span>
                        <span className="breadcrumb-separator mx-1">/</span>
                        <span className="breadcrumb-item active text-primary font-medium">Customers</span>
                    </nav>
                    <h1 className="page-title">Customers</h1>
                    <p className="page-subtitle text-muted">Manage your client base and their vehicles</p>
                </div>

                <Link href="/dashboard/customers/add" className="btn btn-primary">
                    <Plus size={18} className="mr-2" />
                    Add Customer
                </Link>
            </div>

            <CustomerTable initialCustomers={customers} />
        </div>
    );
}
