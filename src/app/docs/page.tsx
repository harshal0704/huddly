import ContentPageLayout from "@/components/shared/ContentPageLayout";
import { BookOpen, Zap, Users, Video, Pen, Radio, MessageCircle, Map } from "lucide-react";

export default function DocsPage() {
    return (
        <ContentPageLayout
            title="Documentation"
            subtitle="Everything you need to build immersive virtual spaces with Huddly."
            badge="Resources"
            lastUpdated="February 21, 2026"
        >
            <h2>Getting Started</h2>
            <p>
                Welcome to Huddly! This guide will walk you through setting up your first virtual space,
                inviting participants, and making the most of our platform&apos;s features.
            </p>

            <h3>Quick Start Guide</h3>
            <ol>
                <li><strong>Create a Room</strong> — Head to your dashboard and click &quot;Create Room.&quot; Choose from our pre-built templates: Classroom, Office, Café, Conference, or Party.</li>
                <li><strong>Customize Your Space</strong> — Use the built-in map editor to arrange furniture, whiteboards, and interactive objects.</li>
                <li><strong>Invite Your Team</strong> — Share the room link with participants. They can join instantly from any modern browser—no downloads required.</li>
                <li><strong>Start Collaborating</strong> — Move your avatar with WASD or click-to-walk. Step close to others to start proximity-based conversations automatically.</li>
            </ol>

            <h2>Core Concepts</h2>

            <h3>Proximity-Based Interaction</h3>
            <p>
                Huddly uses <strong>spatial proximity</strong> to trigger interactions. When your avatar walks close to another
                participant, video and audio connections are automatically established—just like walking up to someone in real life.
                The closer you get, the louder and clearer the audio becomes.
            </p>

            <h3>Virtual Rooms</h3>
            <p>
                Each room is a 2D top-down space rendered using our custom game engine. Rooms support up to <strong>50 concurrent participants</strong>
                with optimized WebRTC connections for smooth audio and video. Rooms can be created from templates or built
                from scratch using the map editor.
            </p>

            <h3>Map Templates</h3>
            <p>Choose from five professionally designed templates:</p>
            <table>
                <thead>
                    <tr><th>Template</th><th>Best For</th><th>Capacity</th></tr>
                </thead>
                <tbody>
                    <tr><td>🏫 Classroom</td><td>Lectures, workshops, training</td><td>30 people</td></tr>
                    <tr><td>🏢 Office</td><td>Daily standup, team collaboration</td><td>20 people</td></tr>
                    <tr><td>☕ Café</td><td>Casual meetups, social events</td><td>15 people</td></tr>
                    <tr><td>🎤 Conference</td><td>Presentations, town halls</td><td>50 people</td></tr>
                    <tr><td>🎉 Party</td><td>Team celebrations, socials</td><td>40 people</td></tr>
                </tbody>
            </table>

            <h2>Features</h2>

            <h3>Video &amp; Voice Calls</h3>
            <p>
                Join video calls with a single click. Your browser will request camera and microphone
                permissions. Once granted, your live video appears in the Video Call panel. Toggle your
                camera and microphone using the toolbar buttons—controls directly enable or disable your
                media tracks in real-time.
            </p>

            <h3>Screen Sharing</h3>
            <p>
                Share your screen, a specific window, or a browser tab with everyone in the room.
                Click the screen share button in the toolbar, select what to share, and your content
                appears in the Broadcast panel. Other participants see it in real-time.
            </p>

            <h3>Whiteboard</h3>
            <p>
                The collaborative whiteboard supports drawing with pen and eraser tools, 8 color presets,
                adjustable line widths, rectangle and circle shapes, text annotations, and
                sticky notes. All changes are visible to everyone in the room. You can undo strokes,
                clear the canvas, or download your whiteboard as a PNG image.
            </p>

            <h3>Broadcasting</h3>
            <p>
                Go live and broadcast your camera feed or screen share to all room participants.
                The broadcast panel shows your viewer count, broadcast duration, and includes controls
                for camera, microphone, and screen sharing. Ideal for presentations, lectures, and announcements.
            </p>

            <h3>Chat</h3>
            <p>
                Send messages to everyone via Global chat, or only to nearby participants via Proximity chat.
                Chat history persists throughout the session. Supports text messages with timestamps and sender names.
            </p>

            <h3>Emotes</h3>
            <p>
                Press <code>Space</code> to open the emote wheel. Select an emoji to display it above your
                avatar for a few seconds—great for reactions during presentations or casual interactions.
            </p>

            <h2>Keyboard Shortcuts</h2>
            <table>
                <thead>
                    <tr><th>Shortcut</th><th>Action</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>W / A / S / D</code></td><td>Move avatar (Up / Left / Down / Right)</td></tr>
                    <tr><td><code>Arrow Keys</code></td><td>Move avatar (alternative)</td></tr>
                    <tr><td><code>Click</code></td><td>Click-to-walk pathfinding</td></tr>
                    <tr><td><code>Space</code></td><td>Open emote wheel</td></tr>
                </tbody>
            </table>

            <h2>System Requirements</h2>
            <p>Huddly runs in any modern web browser. For the best experience:</p>
            <ul>
                <li><strong>Browser:</strong> Chrome 90+, Firefox 95+, Safari 15+, or Edge 90+</li>
                <li><strong>Network:</strong> Minimum 5 Mbps download / 2 Mbps upload for video calls</li>
                <li><strong>Hardware:</strong> Webcam and microphone for video/voice features</li>
                <li><strong>OS:</strong> Windows 10+, macOS 11+, Linux (Ubuntu 20.04+), ChromeOS</li>
            </ul>

            <h2>Troubleshooting</h2>

            <h3>Camera / Microphone Not Working</h3>
            <p>
                Make sure your browser has permission to access your camera and microphone. Click the lock/camera
                icon in your browser&apos;s address bar to check permissions. If denied, reset the permissions and refresh the page.
            </p>

            <h3>Screen Share Not Available</h3>
            <p>
                Screen sharing requires a secure context (HTTPS or localhost). If running locally, ensure you&apos;re
                accessing the app at <code>http://localhost:3000</code>.
            </p>

            <h3>Avatar Not Moving</h3>
            <p>
                Click on the game canvas first to give it focus. If the chat input is focused, keyboard
                controls will type text instead of moving your avatar.
            </p>
        </ContentPageLayout>
    );
}
