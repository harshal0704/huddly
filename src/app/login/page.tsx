"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Eye, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/stores/authStore";

export default function LoginPage() {
    const router = useRouter();
    const { loginAsGuest, login } = useAuthStore();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isSignup, setIsSignup] = useState(false);
    const [mode, setMode] = useState<"options" | "email" | "guest">("options");

    const handleGoogleLogin = () => {
        // Mock Google login
        login({
            id: "google-user-1",
            name: "Demo User",
            email: "demo@huddly.app",
            avatar: {
                body: 0, hair: 1, hairColor: "#5C4033", top: 2, topColor: "#4A90D9",
                bottom: 0, bottomColor: "#2C3E50", accessory: 0, skinColor: "#FDBCB4",
            },
            status: "available",
            isGuest: false,
        });
        router.push("/dashboard");
    };

    const handleEmailLogin = () => {
        if (!email) return;
        login({
            id: `email-${Date.now()}`,
            name: email.split("@")[0],
            email,
            avatar: {
                body: 0, hair: 0, hairColor: "#5C4033", top: 0, topColor: "#4A90D9",
                bottom: 0, bottomColor: "#2C3E50", accessory: 0, skinColor: "#FDBCB4",
            },
            status: "available",
            isGuest: false,
        });
        router.push("/dashboard");
    };

    const handleGuestLogin = () => {
        if (!name) return;
        loginAsGuest(name);
        router.push("/room/demo");
    };

    return (
        <div className="min-h-screen bg-[#030014] flex items-center justify-center p-4">
            {/* Background effects */}
            <div className="absolute inset-0 -z-10">
                <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-violet-600/15 rounded-full blur-[120px]" />
                <div className="absolute bottom-1/4 right-1/3 w-[300px] h-[300px] bg-indigo-600/15 rounded-full blur-[120px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className="w-full max-w-md"
            >
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                            <span className="text-lg">🏠</span>
                        </div>
                        <span className="text-2xl font-bold text-white">Huddly</span>
                    </Link>
                    <h1 className="text-2xl font-bold text-white mb-1">
                        {isSignup ? "Create your account" : "Welcome back"}
                    </h1>
                    <p className="text-gray-500 text-sm">
                        {isSignup ? "Start building your virtual world" : "Enter your virtual world"}
                    </p>
                </div>

                {/* Card */}
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-xl p-6 shadow-2xl">
                    {mode === "options" && (
                        <div className="space-y-3">
                            {/* Google */}
                            <Button
                                variant="secondary"
                                className="w-full justify-center gap-3 h-12"
                                onClick={handleGoogleLogin}
                            >
                                <svg className="w-5 h-5" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Continue with Google
                            </Button>

                            {/* Email */}
                            <Button
                                variant="secondary"
                                className="w-full justify-center gap-3 h-12"
                                onClick={() => setMode("email")}
                            >
                                <Mail className="w-5 h-5" />
                                Continue with Email
                            </Button>

                            {/* Divider */}
                            <div className="relative py-3">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-white/10" />
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-gray-900 px-3 text-xs text-gray-500">or</span>
                                </div>
                            </div>

                            {/* Guest */}
                            <Button
                                variant="ghost"
                                className="w-full justify-center gap-3 h-12"
                                onClick={() => setMode("guest")}
                            >
                                <Eye className="w-5 h-5" />
                                Try as visitor (no account needed)
                            </Button>
                        </div>
                    )}

                    {mode === "email" && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1.5 block">Email address</label>
                                <Input
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleEmailLogin}>
                                <Mail className="w-4 h-4" />
                                Send Magic Link
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            <button
                                onClick={() => setMode("options")}
                                className="text-sm text-gray-500 hover:text-gray-300 transition-colors w-full text-center"
                            >
                                ← Back to options
                            </button>
                        </div>
                    )}

                    {mode === "guest" && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-1.5 block">What should we call you?</label>
                                <Input
                                    placeholder="Your name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                />
                            </div>
                            <Button className="w-full" onClick={handleGuestLogin}>
                                <User className="w-4 h-4" />
                                Enter as Guest
                                <ArrowRight className="w-4 h-4" />
                            </Button>
                            <button
                                onClick={() => setMode("options")}
                                className="text-sm text-gray-500 hover:text-gray-300 transition-colors w-full text-center"
                            >
                                ← Back to options
                            </button>
                        </div>
                    )}
                </div>

                {/* Bottom toggle */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
                    <button
                        onClick={() => setIsSignup(!isSignup)}
                        className="text-violet-400 hover:text-violet-300 font-medium transition-colors"
                    >
                        {isSignup ? "Log in" : "Sign up"}
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
