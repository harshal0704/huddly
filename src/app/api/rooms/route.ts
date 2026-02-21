import { NextRequest, NextResponse } from "next/server";

// In-memory room store (for demo — in production this would be a database)
interface Room {
    id: string;
    name: string;
    template: "classroom" | "office" | "cafe" | "conference" | "party";
    max_participants: number;
    is_private: boolean;
    online_count: number;
    created_at: string;
}

const rooms: Map<string, Room> = new Map([
    ["demo", {
        id: "demo",
        name: "Demo Classroom",
        template: "classroom",
        max_participants: 30,
        is_private: false,
        online_count: 9,
        created_at: "2026-01-15T10:00:00Z",
    }],
    ["office", {
        id: "office",
        name: "Team Office",
        template: "office",
        max_participants: 20,
        is_private: false,
        online_count: 5,
        created_at: "2026-01-20T14:00:00Z",
    }],
    ["cafe", {
        id: "cafe",
        name: "Coffee Lounge",
        template: "cafe",
        max_participants: 15,
        is_private: false,
        online_count: 7,
        created_at: "2026-02-01T09:00:00Z",
    }],
    ["conference", {
        id: "conference",
        name: "Tech Talk Hall",
        template: "conference",
        max_participants: 50,
        is_private: false,
        online_count: 12,
        created_at: "2026-02-05T16:00:00Z",
    }],
    ["party", {
        id: "party",
        name: "Friday Vibes 🎉",
        template: "party",
        max_participants: 40,
        is_private: false,
        online_count: 15,
        created_at: "2026-02-10T18:00:00Z",
    }],
]);

// GET /api/rooms — List all rooms
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 50);

    const allRooms = Array.from(rooms.values());
    const start = (page - 1) * limit;
    const paginatedRooms = allRooms.slice(start, start + limit);

    return NextResponse.json({
        rooms: paginatedRooms,
        total: allRooms.length,
        page,
        per_page: limit,
    });
}

// POST /api/rooms — Create a new room
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, template, max_participants, is_private } = body;

        if (!name || typeof name !== "string" || name.trim().length === 0) {
            return NextResponse.json(
                { error: "name is required and must be a non-empty string" },
                { status: 400 }
            );
        }

        const validTemplates = ["classroom", "office", "cafe", "conference", "party"];
        if (template && !validTemplates.includes(template)) {
            return NextResponse.json(
                { error: `template must be one of: ${validTemplates.join(", ")}` },
                { status: 400 }
            );
        }

        const id = `room_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
        const newRoom: Room = {
            id,
            name: name.trim(),
            template: template || "office",
            max_participants: Math.min(Math.max(max_participants || 20, 2), 100),
            is_private: !!is_private,
            online_count: 0,
            created_at: new Date().toISOString(),
        };

        rooms.set(id, newRoom);

        return NextResponse.json(
            {
                ...newRoom,
                join_url: `${request.nextUrl.origin}/room/${id}`,
            },
            { status: 201 }
        );
    } catch {
        return NextResponse.json(
            { error: "Invalid JSON body" },
            { status: 400 }
        );
    }
}
