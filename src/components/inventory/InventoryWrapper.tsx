import { getMasterServices, getMasterParts } from '@/app/actions/job';
import { getCarLibrary, getVehicleBrands, getPartCategories } from '@/app/actions/inventory';
import InventoryClient from '@/components/inventory/InventoryClient';

interface InventoryWrapperProps {
    tab: string;
}

export default async function InventoryWrapper({ tab }: InventoryWrapperProps) {
    // Fetch all data in parallel
    const [services, parts, library, brands, categoriesRes] = await Promise.all([
        getMasterServices(),
        getMasterParts(),
        getCarLibrary(),
        getVehicleBrands(),
        getPartCategories()
    ]);

    return (
        <InventoryClient
            initialServices={services}
            initialParts={parts}
            initialLibrary={library}
            initialBrands={brands}
            initialCategories={categoriesRes.success ? categoriesRes.data : []}
            initialTab={tab}
        />
    );
}
