'use client';

import { useState } from 'react';
import { Pencil, X as Close } from 'lucide-react';
import { Settings, Cpu } from 'lucide-react';
import AddServiceForm from '@/components/AddServiceForm';
import AddPartForm from '@/components/AddPartForm';
import SortableItemList from '@/components/SortableItemList';
import CollapsibleSection from '@/components/CollapsibleSection';

interface Props {
    jobId: number;
    services: any[];
    parts: any[];
    futureServices: any[];
    futureParts: any[];
    masterServices: any[];
    masterParts: any[];
    isAdmin: boolean;
    isLocked: boolean;
}

export default function JobItemsSections({
    jobId, services, parts, futureServices, futureParts,
    masterServices, masterParts, isAdmin, isLocked,
}: Props) {
    const [serviceEditMode, setServiceEditMode] = useState(false);
    const [partEditMode, setPartEditMode] = useState(false);

    const EditToggle = ({ active, onToggle }: { active: boolean; onToggle: () => void }) => (
        <button
            type="button"
            onClick={onToggle}
            title={active ? 'Exit edit mode' : 'Edit prices & quantities'}
            style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '6px 12px', borderRadius: '10px',
                border: `1.5px solid ${active ? 'rgba(59,130,246,0.5)' : 'var(--border)'}`,
                background: active ? 'rgba(59,130,246,0.1)' : 'transparent',
                color: active ? '#3b82f6' : 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
                if (!active) {
                    e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)';
                    e.currentTarget.style.color = '#3b82f6';
                    e.currentTarget.style.background = 'rgba(59,130,246,0.06)';
                }
            }}
            onMouseLeave={e => {
                if (!active) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.color = 'var(--text-muted)';
                    e.currentTarget.style.background = 'transparent';
                }
            }}
        >
            {active ? <Close size={12} strokeWidth={2.5} /> : <Pencil size={12} strokeWidth={2.5} />}
            {active ? 'Done' : 'Edit'}
        </button>
    );

    return (
        <>
            {/* ── Services & Labour ── */}
            <CollapsibleSection
                title="Services & Labour"
                icon={<Settings className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}
                rightElement={isAdmin && !isLocked ? <EditToggle active={serviceEditMode} onToggle={() => setServiceEditMode(v => !v)} /> : undefined}
            >
                <div className="flex justify-end mb-4">
                    {!isLocked && !serviceEditMode && <AddServiceForm jobId={jobId} masterServices={masterServices} isAdmin={isAdmin} />}
                </div>
                <SortableItemList
                    jobId={jobId}
                    initialItems={services}
                    type="service"
                    isAdmin={isAdmin}
                    isLocked={isLocked}
                    editMode={serviceEditMode}
                />
            </CollapsibleSection>

            {/* ── Parts & Inventory ── */}
            <CollapsibleSection
                title="Parts & Inventory"
                icon={<Cpu className="w-[18px] h-[18px] md:w-[22px] md:h-[22px] text-primary" />}
                rightElement={isAdmin && !isLocked ? <EditToggle active={partEditMode} onToggle={() => setPartEditMode(v => !v)} /> : undefined}
            >
                <div className="flex justify-end mb-4">
                    {!isLocked && !partEditMode && <AddPartForm jobId={jobId} masterParts={masterParts} isAdmin={isAdmin} />}
                </div>
                <SortableItemList
                    jobId={jobId}
                    initialItems={parts}
                    type="part"
                    isAdmin={isAdmin}
                    isLocked={isLocked}
                    editMode={partEditMode}
                />
            </CollapsibleSection>
        </>
    );
}
