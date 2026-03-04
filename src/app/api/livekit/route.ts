import { NextRequest, NextResponse } from "next/server";
import { AccessToken } from "livekit-server-sdk";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const room = req.nextUrl.searchParams.get("room");
        const usernameParam = req.nextUrl.searchParams.get("username");

        if (!room) {
            return NextResponse.json(
                { error: 'Missing "room" query parameter' },
                { status: 400 }
            );
        }

        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const wsUrl = process.env.NEXT_PUBLIC_LIVEKIT_URL;

        if (!apiKey || !apiSecret || !wsUrl) {
            return NextResponse.json(
                { error: "Server misconfigured. LiveKit keys are missing." },
                { status: 500 }
            );
        }

        // Try to get authenticated user from Clerk
        const user = await currentUser();

        // Fallback to guest or requested name if not logged in (development)
        const participantIdentity = user?.id || `guest-${Math.random().toString(36).substring(2, 9)}`;
        const participantName = user?.firstName || user?.username || usernameParam || "Guest User";

        const at = new AccessToken(apiKey, apiSecret, {
            identity: participantIdentity,
            name: participantName,
        });

        at.addGrant({ room, roomJoin: true, canPublish: true, canSubscribe: true });

        const token = at.toJwt();

        return NextResponse.json({ token, identity: participantIdentity, name: participantName });
    } catch (error: any) {
        console.error("LiveKit token generation error:", error);
        return NextResponse.json(
            { error: "Failed to generate token" },
            { status: 500 }
        );
    }
}
