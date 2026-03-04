import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// In-memory fallback for when Supabase is not configured
interface Room {
    id: string;
    name: string;
    description: string;
    template: string;
    max_capacity: number;
    visibility: string;
    custom_objects: unknown[];
    owner_id: string;
    online_count: number;
    created_at: string;
}

const fallbackRooms: Room[] = [
    { id: "office", name: "Team HQ 🏢", description: "Our virtual office", template: "office", max_capacity: 50, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-01T00:00:00Z" },
    { id: "demo", name: "Demo Classroom 📚", description: "A cozy classroom", template: "classroom", max_capacity: 25, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-01-15T00:00:00Z" },
    { id: "cafe", name: "Pixel Café ☕", description: "Grab a virtual coffee", template: "cafe", max_capacity: 15, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-10T00:00:00Z" },
    { id: "conference", name: "Tech Talk Hall 🎤", description: "Presentations and AMAs", template: "conference", max_capacity: 100, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-05T00:00:00Z" },
    { id: "party", name: "Friday Vibes 🎉", description: "Weekend Party Island", template: "party", max_capacity: 30, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-14T00:00:00Z" },
    { id: "library", name: "Quiet Library 📖", description: "Focus zone with bookshelves", template: "library", max_capacity: 20, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-15T00:00:00Z" },
    { id: "gaming", name: "Gaming Lounge 🎮", description: "Arcade cabinets and neon vibes", template: "gaming", max_capacity: 20, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-16T00:00:00Z" },
    { id: "rooftop", name: "Rooftop Bar 🌃", description: "City skyline views", template: "rooftop", max_capacity: 25, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-17T00:00:00Z" },
    { id: "theater", name: "Theater 🎭", description: "Watch party with stage", template: "theater", max_capacity: 50, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-18T00:00:00Z" },
    { id: "blank", name: "Blank Canvas 🎨", description: "Build your own", template: "blank", max_capacity: 20, visibility: "public", custom_objects: [], owner_id: "system", online_count: 0, created_at: "2026-02-19T00:00:00Z" },
];

const VALID_TEMPLATES = ["classroom", "office", "cafe", "conference", "party", "library", "gaming", "rooftop", "theater", "blank", "custom"];

// GET /api/rooms — List all rooms
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    try {
        const supabase = await createClient();
        const { data, error, count } = await supabase
            .from("rooms")
            .select("*", { count: "exact" })
            .order("created_at", { ascending: false })
            .range((page - 1) * limit, page * limit - 1);

        if (error) throw error;

        return NextResponse.json({
            rooms: data,
            total: count,
            page,
            per_page: limit,
        });
    } catch {
        // Fallback to in-memory rooms
        const start = (page - 1) * limit;
        return NextResponse.json({
            rooms: fallbackRooms.slice(start, start + limit),
            total: fallbackRooms.length,
            page,
            per_page: limit,
        });
    }
}

// POST /api/rooms — Create a new room
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, template, max_capacity, visibility, custom_objects } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "name is required and must be a non-empty string" },
                { status: 400 }
            );
        }

        if (template && !VALID_TEMPLATES.includes(template)) {
            return NextResponse.json(
                { error: `template must be one of: ${VALID_TEMPLATES.join(", ")}` },
                { status: 400 }
            );
        }

        const roomData = {
            name: name.trim(),
            description: description || "",
            template: template || "office",
            max_capacity: Math.min(Math.max(max_capacity || 20, 2), 100),
            visibility: visibility || "public",
            custom_objects: custom_objects || [],
            owner_id: "anonymous",
        };

        try {
            const supabase = await createClient();
            const { data, error } = await supabase
                .from("rooms")
                .insert(roomData)
                .select()
                .single();

            if (error) throw error;

            return NextResponse.json(
                {
                    ...data,
                    join_url: `${request.nextUrl.origin}/room/${data.id}`,
                },
                { status: 201 }
            );
        } catch {
            // Fallback to in-memory
            const id = `room_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
            const newRoom = { id, ...roomData, online_count: 0, created_at: new Date().toISOString() };
            fallbackRooms.push(newRoom);

            return NextResponse.json(
                {
                    ...newRoom,
                    join_url: `${request.nextUrl.origin}/room/${id}`,
                },
                { status: 201 }
            );
        }
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }
}
