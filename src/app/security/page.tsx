import ContentPageLayout from "@/components/shared/ContentPageLayout";

export default function SecurityPage() {
    return (
        <ContentPageLayout
            title="Security"
            subtitle="How we protect your data, privacy, and communications on Huddly."
            badge="Legal"
            lastUpdated="February 21, 2026"
        >
            <h2>Our Security Philosophy</h2>
            <p>
                Security is foundational to Huddly. We build with a defense-in-depth approach, implementing
                multiple layers of protection so that a failure in any single layer does not compromise
                the entire system. We are committed to transparency about our security practices.
            </p>

            <h2>Data Encryption</h2>

            <h3>In Transit</h3>
            <ul>
                <li>All HTTP traffic is encrypted using <strong>TLS 1.3</strong> with modern cipher suites</li>
                <li>WebSocket connections use <strong>WSS</strong> (WebSocket Secure) protocol</li>
                <li>WebRTC audio/video streams are encrypted with <strong>DTLS-SRTP</strong></li>
                <li>API communications use certificate pinning to prevent MITM attacks</li>
            </ul>

            <h3>At Rest</h3>
            <ul>
                <li>Database storage encrypted with <strong>AES-256</strong></li>
                <li>File uploads encrypted before storage</li>
                <li>Encryption keys are managed through a hardware security module (HSM)</li>
                <li>Backups are encrypted and stored in geographically separate locations</li>
            </ul>

            <h2>Authentication &amp; Access Control</h2>
            <ul>
                <li>Passwords hashed with <strong>bcrypt</strong> (minimum 12 salt rounds)</li>
                <li>Support for <strong>OAuth 2.0</strong> (Google, GitHub) single sign-on</li>
                <li>Session tokens are cryptographically random, short-lived, and rotated automatically</li>
                <li>Rate limiting on login attempts to prevent brute-force attacks</li>
                <li>Role-based access control (RBAC) for room permissions</li>
            </ul>

            <h2>Infrastructure Security</h2>
            <ul>
                <li>Hosted on <strong>Vercel</strong> with automatic DDoS protection and global CDN</li>
                <li>Database hosted on <strong>Supabase</strong> with row-level security (RLS) policies</li>
                <li>Network segmentation and firewall rules restricting access to critical services</li>
                <li>Automated vulnerability scanning of all dependencies</li>
                <li>Container isolation for all server-side processes</li>
            </ul>

            <h2>Real-Time Communication Security</h2>
            <p>
                Huddly&apos;s real-time features are designed with privacy at their core:
            </p>
            <ul>
                <li><strong>Peer-to-peer by default:</strong> Video and audio streams travel directly between participants using WebRTC, never passing through our servers</li>
                <li><strong>No recording:</strong> We do not record audio, video, or screen share streams unless explicitly enabled by the room host</li>
                <li><strong>Ephemeral chat:</strong> Chat messages are transmitted in real-time and are not persisted on our servers after the session ends</li>
                <li><strong>Whiteboard data:</strong> Drawing strokes are ephemeral and not stored after the session</li>
            </ul>

            <h2>Application Security</h2>
            <ul>
                <li><strong>Input validation:</strong> All user inputs are validated and sanitized server-side</li>
                <li><strong>CSRF protection:</strong> Anti-CSRF tokens on all state-changing requests</li>
                <li><strong>XSS prevention:</strong> Content Security Policy (CSP) headers and output encoding</li>
                <li><strong>SQL injection prevention:</strong> Parameterized queries and ORM usage throughout</li>
                <li><strong>Dependency security:</strong> Automated scanning with Snyk and GitHub Dependabot</li>
            </ul>

            <h2>Compliance</h2>
            <ul>
                <li><strong>GDPR:</strong> We comply with the General Data Protection Regulation for EU users</li>
                <li><strong>CCPA:</strong> We comply with the California Consumer Privacy Act</li>
                <li><strong>SOC 2 Type II:</strong> Audit in progress (expected completion Q2 2026)</li>
            </ul>

            <h2>Incident Response</h2>
            <p>
                In the event of a security incident, our response process includes:
            </p>
            <ol>
                <li><strong>Detection:</strong> Automated monitoring and anomaly detection across all systems</li>
                <li><strong>Containment:</strong> Immediate isolation of affected systems</li>
                <li><strong>Investigation:</strong> Root cause analysis by our security team</li>
                <li><strong>Notification:</strong> Affected users notified within 72 hours of confirmed breach</li>
                <li><strong>Remediation:</strong> Fixes deployed and post-incident review conducted</li>
            </ol>

            <h2>Responsible Disclosure</h2>
            <p>
                We welcome security researchers to report vulnerabilities responsibly. If you discover a
                security issue, please email <strong>security@huddly.app</strong> with details. We commit to:
            </p>
            <ul>
                <li>Acknowledging your report within 24 hours</li>
                <li>Providing regular updates on remediation progress</li>
                <li>Not pursuing legal action against good-faith researchers</li>
                <li>Crediting you in our security advisories (with your permission)</li>
            </ul>

            <h2>Contact</h2>
            <p>
                For security concerns or to report a vulnerability, contact our security team at{" "}
                <strong>security@huddly.app</strong>.
            </p>
        </ContentPageLayout>
    );
}
