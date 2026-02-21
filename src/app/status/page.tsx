"use client";

import ContentPageLayout from "@/components/shared/ContentPageLayout";
import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, Clock, Activity } from "lucide-react";

const SERVICES = [
    { name: "Web Application", status: "operational", uptime: "99.98%" },
    { name: "API Gateway", status: "operational", uptime: "99.99%" },
    { name: "WebSocket Server", status: "operational", uptime: "99.97%" },
    { name: "Video / Audio (WebRTC)", status: "operational", uptime: "99.95%" },
    { name: "Media Processing", status: "operational", uptime: "99.93%" },
    { name: "Database (PostgreSQL)", status: "operational", uptime: "99.99%" },
    { name: "CDN &amp; Static Assets", status: "operational", uptime: "99.99%" },
    { name: "Authentication Service", status: "operational", uptime: "99.98%" },
];

const INCIDENTS = [
    {
        date: "Feb 18, 2026",
        title: "Elevated latency on WebSocket connections",
        status: "resolved",
        description: "A brief spike in latency was observed for WebSocket connections in the EU region. Root cause was identified as a misconfigured load balancer. Resolved within 12 minutes.",
    },
    {
        date: "Feb 12, 2026",
        title: "Scheduled maintenance — Database upgrade",
        status: "completed",
        description: "Planned maintenance window to upgrade PostgreSQL from 15.4 to 16.1. Downtime was less than 3 minutes. All services restored successfully.",
    },
    {
        date: "Feb 5, 2026",
        title: "Intermittent screen share failures",
        status: "resolved",
        description: "Some users experienced screen share failures due to a TURN server issue. A hotfix was deployed within 30 minutes.",
    },
];

export default function StatusPage() {
    return (
        <ContentPageLayout
            title="System Status"
            subtitle="Real-time operational status of all Huddly services."
            badge="Resources"
        >
            {/* Overall status */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="not-prose mb-8 p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-center gap-4"
            >
                <CheckCircle className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                <div>
                    <h3 className="text-lg font-bold text-emerald-400">All Systems Operational</h3>
                    <p className="text-sm text-gray-400">All services are running smoothly. Last checked: just now.</p>
                </div>
            </motion.div>

            {/* Service grid */}
            <div className="not-prose space-y-2 mb-12">
                {SERVICES.map((service, i) => (
                    <motion.div
                        key={service.name}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/30" />
                            <span className="text-sm text-white font-medium">{service.name}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-xs text-gray-500">{service.uptime} uptime</span>
                            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                                Operational
                            </span>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Uptime chart mockup */}
            <h2>90-Day Uptime</h2>
            <div className="not-prose mb-8 p-4 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-end gap-0.5 h-16">
                    {Array.from({ length: 90 }, (_, i) => {
                        const height = 85 + Math.random() * 15;
                        return (
                            <div
                                key={i}
                                className="flex-1 rounded-t bg-emerald-400/60 hover:bg-emerald-400 transition-colors cursor-pointer"
                                style={{ height: `${height}%` }}
                                title={`Day ${90 - i}: ${height.toFixed(1)}%`}
                            />
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                    <span>90 days ago</span>
                    <span>Today</span>
                </div>
            </div>

            <h2>Recent Incidents</h2>
            <div className="not-prose space-y-4">
                {INCIDENTS.map((incident, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + i * 0.1 }}
                        className="p-4 rounded-xl bg-white/[0.02] border border-white/5"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                {incident.status === "resolved" ? (
                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                ) : (
                                    <Clock className="w-4 h-4 text-amber-400" />
                                )}
                                <span className="text-sm font-medium text-white">{incident.title}</span>
                            </div>
                            <span className="text-[10px] text-gray-500">{incident.date}</span>
                        </div>
                        <p className="text-xs text-gray-400 leading-relaxed">{incident.description}</p>
                    </motion.div>
                ))}
            </div>
        </ContentPageLayout>
    );
}
