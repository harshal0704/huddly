import { NextRequest, NextResponse } from "next/server";

// GET /api/rooms/[id] — Get room details
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    // Demo room data
    const rooms: Record<string, any> = {
        demo: {
            id: "demo",
            name: "Demo Classroom",
            template: "classroom",
            max_participants: 30,
            is_private: false,
            online_count: 9,
            created_at: "2026-01-15T10:00:00Z",
        },
        office: {
            id: "office",
            name: "Team Office",
            template: "office",
            max_participants: 20,
            is_private: false,
            online_count: 5,
            created_at: "2026-01-20T14:00:00Z",
        },
        cafe: {
            id: "cafe",
            name: "Coffee Lounge",
            template: "cafe",
            max_participants: 15,
            is_private: false,
            online_count: 7,
            created_at: "2026-02-01T09:00:00Z",
        },
        conference: {
            id: "conference",
            name: "Tech Talk Hall",
            template: "conference",
            max_participants: 50,
            is_private: false,
            online_count: 12,
            created_at: "2026-02-05T16:00:00Z",
        },
        party: {
            id: "party",
            name: "Friday Vibes 🎉",
            template: "party",
            max_participants: 40,
            is_private: false,
            online_count: 15,
            created_at: "2026-02-10T18:00:00Z",
        },
    };

    const room = rooms[id];
    if (!room) {
        return NextResponse.json(
            { error: "Room not found" },
            { status: 404 }
        );
    }

    return NextResponse.json(room);
}

// DELETE /api/rooms/[id] — Delete a room
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;

    // In demo mode, don't allow deleting default rooms
    const protectedRooms = ["demo", "office", "cafe", "conference", "party"];
    if (protectedRooms.includes(id)) {
        return NextResponse.json(
            { error: "Cannot delete default demo rooms" },
            { status: 403 }
        );
    }

    return new NextResponse(null, { status: 204 });
}
