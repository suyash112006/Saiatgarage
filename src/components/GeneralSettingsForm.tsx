"use client";

import { useState } from "react";
import { Save, Loader2, Check, Building2, Percent, Info } from "lucide-react";
import { updateGeneralSettings } from "@/app/actions/settings";
import { toast } from "sonner";

interface GeneralSettingsFormProps {
    initialSettings: Record<string, string>;
}

export default function GeneralSettingsForm({ initialSettings }: GeneralSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const [garageName, setGarageName] = useState(initialSettings.garage_name || '');
    const [taxRate, setTaxRate] = useState(initialSettings.tax_rate || '18');

    const isDirty =
        garageName !== (initialSettings.garage_name || '') ||
        taxRate !== (initialSettings.tax_rate || '18');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        if (!isDirty) return;

        // Client-side guard
        const rate = parseFloat(taxRate);
        if (!garageName.trim() || garageName.trim().length < 2) {
            toast.error('Garage name must be at least 2 characters');
            return;
        }
        if (isNaN(rate) || rate < 0 || rate > 100) {
            toast.error('Tax rate must be between 0 and 100');
            return;
        }

        setLoading(true);
        setSaved(false);

        const formData = new FormData(e.currentTarget);
        const result = await updateGeneralSettings(formData);

        if (result.success) {
            setSaved(true);
            toast.success('Settings saved successfully');
            setTimeout(() => setSaved(false), 3000);
        } else {
            toast.error(result.error || 'Failed to save settings');
        }
        setLoading(false);
    }

    return (
        <div className="card flex flex-col h-full">
            <div className="card-header">
                <div className="header-group">
                    <div className="card-icon">
                        <Save size={18} />
                    </div>
                    <div>
                        <h3>General Configuration</h3>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                            Admin only · affects all users
                        </p>
                    </div>
                </div>

                {isDirty && !loading && (
                    <span style={{
                        fontSize: '10px', fontWeight: 800, letterSpacing: '0.06em',
                        textTransform: 'uppercase', color: '#f59e0b',
                        background: 'rgba(245,158,11,0.1)', padding: '3px 10px',
                        borderRadius: '999px', border: '1px solid rgba(245,158,11,0.25)',
                    }}>
                        Unsaved
                    </span>
                )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-5 mt-2">

                    {/* Garage Name */}
                    <div className="form-field">
                        <label style={{
                            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.06em', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                        }}>
                            <Building2 size={12} />
                            Garage Name
                        </label>
                        <div className="input-wrapper" style={{ position: 'relative' }}>
                            <input
                                type="text"
                                name="garageName"
                                value={garageName}
                                onChange={e => setGarageName(e.target.value)}
                                placeholder="e.g. Sai Auto Service"
                                required
                                minLength={2}
                                maxLength={100}
                                style={{ paddingRight: '60px' }}
                            />
                            <span style={{
                                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                fontSize: '10px', fontWeight: 600, color: garageName.length > 90 ? '#ef4444' : 'var(--text-muted)',
                            }}>
                                {garageName.length}/100
                            </span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Info size={10} /> Appears on invoices and estimates
                        </p>
                    </div>

                    {/* Tax Rate */}
                    <div className="form-field">
                        <label style={{
                            fontSize: '11px', fontWeight: 700, textTransform: 'uppercase',
                            letterSpacing: '0.06em', color: 'var(--text-muted)',
                            display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px',
                        }}>
                            <Percent size={12} />
                            Tax Rate (%)
                        </label>
                        <div className="input-wrapper" style={{ position: 'relative' }}>
                            <input
                                type="number"
                                name="taxRate"
                                value={taxRate}
                                onChange={e => setTaxRate(e.target.value)}
                                placeholder="e.g. 18"
                                required
                                min={0}
                                max={100}
                                step={0.01}
                                style={{ paddingRight: '40px' }}
                            />
                            <span style={{
                                position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)',
                                fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)',
                            }}>
                                %
                            </span>
                        </div>
                        <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Info size={10} /> Changing this recalculates all open job totals
                        </p>
                    </div>
                </div>

                <div className="card-footer">
                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={loading || !isDirty}
                        style={{
                            opacity: !isDirty ? 0.5 : 1,
                            cursor: !isDirty ? 'not-allowed' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: '8px',
                            transition: 'all 0.2s',
                        }}
                    >
                        {loading ? (
                            <><Loader2 size={16} className="animate-spin" /> Saving…</>
                        ) : saved ? (
                            <><Check size={16} /> Saved!</>
                        ) : (
                            <><Save size={16} /> Save Changes</>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
