import { getTrashedItems } from '@/app/actions/trash';
import TrashClient from '@/components/TrashClient';

export default async function TrashWrapper() {
    const { customers, jobs } = await getTrashedItems();

    return <TrashClient customers={customers} jobs={jobs} />;
}
