import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { currentUser } from "@clerk/nextjs/server";

// GET /api/rooms/[id] — Fetch a single room
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const supabase = await createClient();
        const { data, error } = await supabase
            .from("rooms")
            .select("*")
            .eq("id", id)
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch {
        return NextResponse.json(
            { error: "Room not found" },
            { status: 404 }
        );
    }
}

// PATCH /api/rooms/[id] — Update a room (owner only)
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const allowedFields = ["name", "description", "visibility", "max_capacity", "template", "custom_objects", "map_data"];
        const updates: Record<string, unknown> = {};

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
        }

        const supabase = await createClient();

        // Verify ownership
        const { data: room } = await supabase
            .from("rooms")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.owner_id !== user.id && room.owner_id !== "system") {
            return NextResponse.json({ error: "Not authorized to update this room" }, { status: 403 });
        }

        const { data, error } = await supabase
            .from("rooms")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to update room" },
            { status: 500 }
        );
    }
}

// DELETE /api/rooms/[id] — Delete a room (owner only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const supabase = await createClient();

        // Verify ownership
        const { data: room } = await supabase
            .from("rooms")
            .select("owner_id")
            .eq("id", id)
            .single();

        if (!room) {
            return NextResponse.json({ error: "Room not found" }, { status: 404 });
        }

        if (room.owner_id !== user.id) {
            return NextResponse.json({ error: "Not authorized to delete this room" }, { status: 403 });
        }

        if (room.owner_id === "system") {
            return NextResponse.json({ error: "Cannot delete system rooms" }, { status: 403 });
        }

        const { error } = await supabase
            .from("rooms")
            .delete()
            .eq("id", id);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (err: any) {
        return NextResponse.json(
            { error: err.message || "Failed to delete room" },
            { status: 500 }
        );
    }
}
