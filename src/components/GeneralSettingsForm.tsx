"use client";

import { useState } from "react";
import { Save, Loader2, Check } from "lucide-react";
import { updateGeneralSettings } from "@/app/actions/settings";

interface GeneralSettingsFormProps {
    initialSettings: Record<string, string>;
}

export default function GeneralSettingsForm({ initialSettings }: GeneralSettingsFormProps) {
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setSuccess(false);

        const formData = new FormData(e.currentTarget);
        const result = await updateGeneralSettings(formData);

        if (result.success) {
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } else {
            alert(result.error);
        }
        setLoading(false);
    }

    return (
        <div className="card">
            <div className="card-header">
                <div className="card-icon">
                    <Save size={18} />
                </div>
                <h3>General Configuration</h3>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col h-full">
                <div className="space-y-4">
                    <div className="form-field">
                        <label className="text-xs font-semibold text-muted mb-1 block">Garage Name</label>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                name="garageName"
                                defaultValue={initialSettings.garage_name}
                                placeholder="Enter garage name"
                                required
                            />
                        </div>
                    </div>
                    <div className="form-field">
                        <label className="text-xs font-semibold text-muted mb-1 block">Tax Rate (%)</label>
                        <div className="input-wrapper">
                            <input
                                type="number"
                                name="taxRate"
                                defaultValue={initialSettings.tax_rate}
                                placeholder="e.g. 18"
                                required
                            />
                        </div>
                    </div>
                </div>

                <div className="card-footer">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? (
                            <Loader2 size={18} className="mr-2 animate-spin" />
                        ) : success ? (
                            <Check size={18} className="mr-2" />
                        ) : (
                            <Save size={18} className="mr-2" />
                        )}
                        {success ? "Saved!" : "Save Changes"}
                    </button>
                </div>
            </form>
        </div>
    );
}
