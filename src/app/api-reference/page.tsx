import ContentPageLayout from "@/components/shared/ContentPageLayout";

export default function ApiReferencePage() {
    return (
        <ContentPageLayout
            title="API Reference"
            subtitle="Integrate Huddly into your applications with our REST and WebSocket APIs."
            badge="Resources"
            lastUpdated="February 21, 2026"
        >
            <h2>Overview</h2>
            <p>
                The Huddly API lets you programmatically create and manage rooms, users, and real-time events.
                All endpoints return JSON and require authentication via API keys.
            </p>

            <h3>Base URL</h3>
            <pre><code>https://api.huddly.app/v1</code></pre>

            <h3>Authentication</h3>
            <p>
                Include your API key in the <code>Authorization</code> header:
            </p>
            <pre><code>{`Authorization: Bearer YOUR_API_KEY`}</code></pre>
            <p>
                API keys can be generated from your <strong>Dashboard → Settings → API Keys</strong> page.
                Keep your keys secure—do not expose them in client-side code.
            </p>

            <h2>Rooms</h2>

            <h3>Create a Room</h3>
            <pre><code>{`POST /rooms

{
  "name": "Team Standup",
  "template": "office",
  "max_participants": 20,
  "is_private": false
}

Response 201:
{
  "id": "room_abc123",
  "name": "Team Standup",
  "template": "office",
  "max_participants": 20,
  "is_private": false,
  "join_url": "https://huddly.app/room/room_abc123",
  "created_at": "2026-02-21T10:30:00Z"
}`}</code></pre>

            <h3>List Rooms</h3>
            <pre><code>{`GET /rooms?page=1&limit=20

Response 200:
{
  "rooms": [...],
  "total": 42,
  "page": 1,
  "per_page": 20
}`}</code></pre>

            <h3>Get Room Details</h3>
            <pre><code>{`GET /rooms/:id

Response 200:
{
  "id": "room_abc123",
  "name": "Team Standup",
  "template": "office",
  "online_count": 5,
  "participants": [
    { "id": "user_1", "name": "Alex", "avatar_url": "..." }
  ],
  "created_at": "2026-02-21T10:30:00Z"
}`}</code></pre>

            <h3>Delete a Room</h3>
            <pre><code>{`DELETE /rooms/:id

Response 204: No Content`}</code></pre>

            <h2>Participants</h2>

            <h3>List Room Participants</h3>
            <pre><code>{`GET /rooms/:id/participants

Response 200:
{
  "participants": [
    {
      "id": "user_1",
      "name": "Alex",
      "status": "online",
      "is_muted": false,
      "is_camera_on": true,
      "position": { "x": 120, "y": 85 }
    }
  ]
}`}</code></pre>

            <h3>Remove a Participant</h3>
            <pre><code>{`DELETE /rooms/:id/participants/:user_id

Response 204: No Content`}</code></pre>

            <h2>WebSocket Events</h2>
            <p>Connect to real-time room events via WebSocket:</p>
            <pre><code>{`wss://api.huddly.app/v1/ws?room_id=room_abc123&token=YOUR_TOKEN`}</code></pre>

            <h3>Event Types</h3>
            <table>
                <thead>
                    <tr><th>Event</th><th>Description</th><th>Payload</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>participant.joined</code></td><td>User entered the room</td><td><code>{`{ user_id, name }`}</code></td></tr>
                    <tr><td><code>participant.left</code></td><td>User left the room</td><td><code>{`{ user_id }`}</code></td></tr>
                    <tr><td><code>participant.moved</code></td><td>User avatar position changed</td><td><code>{`{ user_id, x, y }`}</code></td></tr>
                    <tr><td><code>chat.message</code></td><td>New chat message sent</td><td><code>{`{ user_id, text, channel }`}</code></td></tr>
                    <tr><td><code>broadcast.started</code></td><td>User started broadcasting</td><td><code>{`{ user_id }`}</code></td></tr>
                    <tr><td><code>broadcast.ended</code></td><td>User stopped broadcasting</td><td><code>{`{ user_id }`}</code></td></tr>
                    <tr><td><code>whiteboard.stroke</code></td><td>Drawing stroke on whiteboard</td><td><code>{`{ user_id, path, color, width }`}</code></td></tr>
                </tbody>
            </table>

            <h2>Rate Limits</h2>
            <table>
                <thead>
                    <tr><th>Plan</th><th>Requests/min</th><th>WebSocket connections</th></tr>
                </thead>
                <tbody>
                    <tr><td>Free</td><td>60</td><td>5</td></tr>
                    <tr><td>Pro</td><td>300</td><td>50</td></tr>
                    <tr><td>Enterprise</td><td>Unlimited</td><td>Unlimited</td></tr>
                </tbody>
            </table>

            <h2>Error Codes</h2>
            <table>
                <thead>
                    <tr><th>Code</th><th>Meaning</th></tr>
                </thead>
                <tbody>
                    <tr><td><code>400</code></td><td>Bad Request — Invalid parameters</td></tr>
                    <tr><td><code>401</code></td><td>Unauthorized — Invalid or missing API key</td></tr>
                    <tr><td><code>403</code></td><td>Forbidden — Insufficient permissions</td></tr>
                    <tr><td><code>404</code></td><td>Not Found — Resource does not exist</td></tr>
                    <tr><td><code>429</code></td><td>Rate Limited — Too many requests</td></tr>
                    <tr><td><code>500</code></td><td>Internal Server Error</td></tr>
                </tbody>
            </table>

            <h2>SDKs &amp; Libraries</h2>
            <p>Official client libraries are available for popular platforms:</p>
            <ul>
                <li><strong>JavaScript / TypeScript:</strong> <code>npm install @huddly/sdk</code></li>
                <li><strong>Python:</strong> <code>pip install huddly-sdk</code></li>
                <li><strong>Go:</strong> <code>go get github.com/huddly/sdk-go</code></li>
            </ul>
        </ContentPageLayout>
    );
}
