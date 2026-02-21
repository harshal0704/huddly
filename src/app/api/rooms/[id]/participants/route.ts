import { NextRequest, NextResponse } from "next/server";

// Simulated participant store per room
interface Participant {
    id: string;
    name: string;
    status: "online" | "away" | "offline";
    is_muted: boolean;
    is_camera_on: boolean;
    position: { x: number; y: number };
    joined_at: string;
}

const roomParticipants: Record<string, Participant[]> = {
    demo: [
        { id: "u1", name: "Alex", status: "online", is_muted: false, is_camera_on: true, position: { x: 120, y: 85 }, joined_at: "2026-02-21T10:00:00Z" },
        { id: "u2", name: "Maya", status: "online", is_muted: false, is_camera_on: true, position: { x: 200, y: 150 }, joined_at: "2026-02-21T10:05:00Z" },
        { id: "u3", name: "Sam", status: "online", is_muted: true, is_camera_on: true, position: { x: 300, y: 200 }, joined_at: "2026-02-21T10:10:00Z" },
        { id: "u4", name: "Jo", status: "online", is_muted: false, is_camera_on: false, position: { x: 400, y: 100 }, joined_at: "2026-02-21T10:15:00Z" },
        { id: "u5", name: "Taylor", status: "online", is_muted: false, is_camera_on: true, position: { x: 250, y: 300 }, joined_at: "2026-02-21T10:20:00Z" },
        { id: "u6", name: "Riley", status: "away", is_muted: true, is_camera_on: false, position: { x: 180, y: 250 }, joined_at: "2026-02-21T10:25:00Z" },
        { id: "u7", name: "Jordan", status: "online", is_muted: false, is_camera_on: true, position: { x: 350, y: 180 }, joined_at: "2026-02-21T10:30:00Z" },
        { id: "u8", name: "Morgan", status: "online", is_muted: false, is_camera_on: true, position: { x: 420, y: 280 }, joined_at: "2026-02-21T10:35:00Z" },
        { id: "u9", name: "Casey", status: "online", is_muted: true, is_camera_on: true, position: { x: 150, y: 350 }, joined_at: "2026-02-21T10:40:00Z" },
    ],
    office: [
        { id: "u10", name: "Pat", status: "online", is_muted: false, is_camera_on: true, position: { x: 100, y: 100 }, joined_at: "2026-02-21T09:00:00Z" },
        { id: "u11", name: "Jamie", status: "online", is_muted: false, is_camera_on: true, position: { x: 220, y: 180 }, joined_at: "2026-02-21T09:05:00Z" },
        { id: "u12", name: "Drew", status: "online", is_muted: true, is_camera_on: false, position: { x: 340, y: 120 }, joined_at: "2026-02-21T09:10:00Z" },
    ],
};

// GET /api/rooms/[id]/participants
export async function GET(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const participants = roomParticipants[id] || [];

    return NextResponse.json({
        room_id: id,
        participants,
        count: participants.length,
    });
}

// DELETE /api/rooms/[id]/participants — remove participant (requires user_id query param)
export async function DELETE(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("user_id");

    if (!userId) {
        return NextResponse.json(
            { error: "user_id query parameter is required" },
            { status: 400 }
        );
    }

    const participants = roomParticipants[id];
    if (!participants) {
        return NextResponse.json(
            { error: "Room not found" },
            { status: 404 }
        );
    }

    const index = participants.findIndex((p) => p.id === userId);
    if (index === -1) {
        return NextResponse.json(
            { error: "Participant not found" },
            { status: 404 }
        );
    }

    participants.splice(index, 1);
    return new NextResponse(null, { status: 204 });
}
