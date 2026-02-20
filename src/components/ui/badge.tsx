import * as React from "react";
import { cn } from "@/lib/utils";

const Badge = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & {
        variant?: "default" | "success" | "warning" | "danger" | "info";
    }
>(({ className, variant = "default", ...props }, ref) => {
    const variants: Record<string, string> = {
        default: "bg-violet-500/20 text-violet-300 border-violet-500/30",
        success: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
        warning: "bg-amber-500/20 text-amber-300 border-amber-500/30",
        danger: "bg-red-500/20 text-red-300 border-red-500/30",
        info: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    };

    return (
        <span
            ref={ref}
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
                variants[variant],
                className
            )}
            {...props}
        />
    );
});
Badge.displayName = "Badge";

export { Badge };
