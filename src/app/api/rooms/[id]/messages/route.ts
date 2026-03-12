import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@clerk/nextjs/server";

// GET /api/rooms/[id]/messages — Fetch chat history
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: roomId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 200);
    const before = searchParams.get("before"); // cursor pagination

    try {
        const supabase = await createClient();
        let query = supabase
            .from("chat_messages")
            .select("*")
            .eq("room_id", roomId)
            .eq("is_deleted", false)
            .order("created_at", { ascending: false })
            .limit(limit);

        if (before) {
            query = query.lt("created_at", before);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Return in chronological order
        return NextResponse.json({
            messages: (data || []).reverse(),
            has_more: (data || []).length === limit,
        });
    } catch {
        return NextResponse.json({ messages: [], has_more: false });
    }
}

// POST /api/rooms/[id]/messages — Save a chat message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: roomId } = await params;

    try {
        const body = await request.json();
        const { content, channel, user_name } = body;

        if (!content || typeof content !== "string" || content.trim().length === 0) {
            return NextResponse.json({ error: "Content is required" }, { status: 400 });
        }

        // Try to get authenticated user
        const user = await currentUser();
        const userId = user?.id || `guest-${Math.random().toString(36).slice(2, 9)}`;
        const userName = user?.firstName || user?.username || user_name || "Guest";

        const messageData = {
            room_id: roomId,
            user_id: userId,
            user_name: userName,
            content: content.trim().slice(0, 2000),
            channel: channel || "global",
        };

        const supabase = await createClient();
        const { data, error } = await supabase
            .from("chat_messages")
            .insert(messageData)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data, { status: 201 });
    } catch {
        // Silently fail — chat should still work via socket
        return NextResponse.json({ error: "Failed to persist message" }, { status: 500 });
    }
}
