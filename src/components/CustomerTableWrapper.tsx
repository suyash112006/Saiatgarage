import { getCustomers } from '@/app/actions/customer';
import CustomerTable from '@/components/CustomerTable';

interface CustomerTableWrapperProps {
    isAdmin: boolean;
}

export default async function CustomerTableWrapper({ isAdmin }: CustomerTableWrapperProps) {
    const customers = await getCustomers();

    return <CustomerTable initialCustomers={customers} isAdmin={isAdmin} />;
}
