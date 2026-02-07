"use client";

import { useEffect, useState } from "react";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { clsx, type ClassValue } from "clsx";

function cn(...inputs: ClassValue[]) {
    return clsx(inputs);
}

interface KPICardProps {
    label: string;
    value: number;
    icon: LucideIcon;
    type: "revenue" | "jobs" | "customers";
    percentChange?: number;
    prefix?: string;
    sparklinePoints?: string;
}

export default function KPICard({
    label,
    value: targetValue,
    icon: Icon,
    type,
    percentChange,
    prefix = "",
    sparklinePoints = "0,20 10,18 20,22 30,15 40,16 50,10 60,12 70,8 80,9 90,5 100,6",
}: KPICardProps) {
    const [displayValue, setDisplayValue] = useState(0);

    // 🔢 Count-up animation
    useEffect(() => {
        let start = 0;
        const duration = 1000; // 1 second
        const startTime = performance.now();

        function animate(time: number) {
            const progress = Math.min((time - startTime) / duration, 1);
            // Ease out quadratic
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            const current = Math.floor(easeProgress * targetValue);
            setDisplayValue(current);

            if (progress < 1) requestAnimationFrame(animate);
        }

        const raf = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(raf);
    }, [targetValue]);

    const isPositive = percentChange && percentChange > 0;

    return (
        <div className="kpi-card">
            <div className="kpi-left">
                <div className={cn("kpi-icon", type)}>
                    <Icon size={18} />
                </div>

                <div className="kpi-content">
                    <span className="kpi-label">{label}</span>
                    <span className="kpi-value">
                        {prefix}{displayValue.toLocaleString()}
                    </span>

                    {percentChange !== undefined && (
                        <span className={cn("kpi-change", isPositive ? "positive" : "negative")}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(percentChange)}% {isPositive ? "up" : "down"}
                        </span>
                    )}
                </div>
            </div>

            {/* 📊 Mini sparkline */}
            <svg className={cn("sparkline", type)} viewBox="0 0 100 30">
                <polyline
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={sparklinePoints}
                />
            </svg>
        </div>
    );
}
