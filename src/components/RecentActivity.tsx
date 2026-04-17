import { getRecentActivity } from '@/app/actions/search';
import DashboardSearch from '@/components/DashboardSearch';

interface RecentActivityProps {
    initialActivity?: any[];
}

export default async function RecentActivity({ initialActivity }: RecentActivityProps) {
    const recentActivity = initialActivity || await getRecentActivity();

    return (
        <div className="mb-10 text-[var(--text-main)]">
            <DashboardSearch initialActivity={recentActivity} />
        </div>
    );
}
