import { getMasterServices, getMasterParts } from '@/app/actions/job';
import { getCarLibrary, getPartLibrary, getVehicleBrands } from '@/app/actions/inventory';
import InventoryClient from '@/components/inventory/InventoryClient';

interface InventoryWrapperProps {
    tab: string;
}

export default async function InventoryWrapper({ tab }: InventoryWrapperProps) {
    // Fetch all data in parallel
    const [services, parts, libraryParts, library, brands] = await Promise.all([
        getMasterServices(),
        getMasterParts(),
        getPartLibrary(),
        getCarLibrary(),
        getVehicleBrands()
    ]);

    return (
        <InventoryClient
            initialServices={services}
            initialParts={parts}
            initialPartLibrary={libraryParts}
            initialLibrary={library}
            initialBrands={brands}
            initialTab={tab}
        />
    );
}
