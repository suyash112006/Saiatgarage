"use client";

import { useState } from "react";
import { X, UserPlus, Loader2, Mail, Lock, User, Eye, EyeOff } from "lucide-react";
import { signupAction } from "@/app/actions/auth";

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SignUpModal({ isOpen, onClose }: SignUpModalProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [password, setPassword] = useState("");

    if (!isOpen) return null;

    const getPasswordStrength = (pwd: string) => {
        let score = 0;
        if (pwd.length >= 8) score++;
        if (/[A-Z]/.test(pwd)) score++;
        if (/[0-9]/.test(pwd)) score++;
        if (/[^A-Za-z0-9]/.test(pwd)) score++;
        return Math.min(score, 3); // Max score 3 for our 3-segment bar
    };

    const strength = getPasswordStrength(password);
    const strengthLabels = ["", "Weak", "Medium", "Strong"];

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters");
            setLoading(false);
            return;
        }

        const formData = new FormData(e.currentTarget);
        const result = await signupAction(formData);

        if (result.success) {
            alert("Account created successfully! Please sign in.");
            onClose();
        } else {
            setError(result.error || "Failed to create account");
        }
        setLoading(false);
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content" style={{ maxWidth: '400px' }}>
                <div className="modal-header">
                    <div className="modal-header-left">
                        <div className="card-icon">
                            <UserPlus size={18} />
                        </div>
                        <h3>Create Account</h3>
                    </div>
                    <button onClick={onClose} className="icon-btn">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="modal-body space-y-4 pt-2">
                        {error && <div className="auth-error" style={{ marginBottom: '16px' }}>{error}</div>}

                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Full Name</label>
                            <div className="input-wrapper">
                                <User size={16} />
                                <input type="text" name="name" placeholder="John Doe" className="bg-slate-50" required />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Email Address</label>
                            <div className="input-wrapper">
                                <Mail size={16} />
                                <input type="email" name="email" placeholder="name@example.com" className="bg-slate-50" required />
                            </div>
                        </div>

                        <div className="form-field">
                            <label className="text-[11px] font-bold uppercase text-slate-500 tracking-wider mb-2 block">Password</label>
                            <div className="input-wrapper">
                                <Lock size={16} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="At least 8 characters"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="bg-slate-50"
                                />
                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>

                            {password && (
                                <div className="strength-meter">
                                    <div className={`strength-bar bar-${strength}`}>
                                        <div className="strength-segment"></div>
                                        <div className="strength-segment"></div>
                                        <div className="strength-segment"></div>
                                    </div>
                                    <span className={`strength-text ${strengthLabels[strength].toLowerCase()}`}>
                                        Password Strength: {strengthLabels[strength]}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="modal-footer pt-6 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-outline"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 size={18} className="mr-2 animate-spin" />
                            ) : (
                                <UserPlus size={18} className="mr-2" />
                            )}
                            {loading ? "Creating..." : "Create Account"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
