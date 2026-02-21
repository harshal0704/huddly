import ContentPageLayout from "@/components/shared/ContentPageLayout";

export default function TermsPage() {
    return (
        <ContentPageLayout
            title="Terms of Service"
            subtitle="Please read these terms carefully before using Huddly."
            badge="Legal"
            lastUpdated="February 21, 2026"
        >
            <h2>1. Acceptance of Terms</h2>
            <p>
                By accessing or using Huddly (&quot;the Service&quot;), you agree to be bound by these Terms of Service.
                If you do not agree to these terms, you may not use the Service. These terms apply to all
                visitors, users, and others who access or use Huddly.
            </p>

            <h2>2. Description of Service</h2>
            <p>
                Huddly is a web-based virtual world platform that enables real-time communication through
                2D spaces with proximity-based audio/video, chat, whiteboard collaboration, and broadcasting.
                The Service is provided &quot;as is&quot; and may be updated, modified, or discontinued at any time.
            </p>

            <h2>3. User Accounts</h2>
            <ul>
                <li>You must provide accurate and complete information when creating an account</li>
                <li>You are responsible for maintaining the security of your account credentials</li>
                <li>You must be at least 13 years old to create an account</li>
                <li>One person or entity may not maintain more than one account</li>
                <li>You are responsible for all activities that occur under your account</li>
            </ul>

            <h2>4. Acceptable Use</h2>
            <p>You agree <strong>not</strong> to:</p>
            <ul>
                <li>Use the Service for any unlawful purpose or in violation of any applicable laws</li>
                <li>Harass, bully, threaten, or intimidate other users</li>
                <li>Share explicit, violent, or hateful content</li>
                <li>Impersonate any person or entity</li>
                <li>Attempt to gain unauthorized access to the Service or its related systems</li>
                <li>Use automated tools, bots, or scrapers to access the Service</li>
                <li>Interfere with or disrupt the Service or its infrastructure</li>
                <li>Upload malware, viruses, or other harmful code</li>
                <li>Reverse-engineer, decompile, or disassemble any part of the Service</li>
            </ul>

            <h2>5. User Content</h2>
            <p>
                You retain ownership of content you create using Huddly, including whiteboard drawings,
                chat messages, and uploaded media. By sharing content in rooms, you grant Huddly a
                non-exclusive, worldwide license to display and transmit that content to other room
                participants during the session.
            </p>
            <p>
                We <strong>do not</strong> claim ownership of your content. Chat messages and whiteboard data
                are ephemeral and are not stored after sessions end, unless you explicitly save or download them.
            </p>

            <h2>6. Privacy</h2>
            <p>
                Your use of the Service is governed by our <a href="/privacy">Privacy Policy</a>,
                which describes how we collect, use, and protect your information.
            </p>

            <h2>7. Intellectual Property</h2>
            <p>
                The Huddly name, logo, software, and all associated designs, text, graphics, and interfaces
                are the property of Huddly and are protected by intellectual property laws. You may not copy,
                modify, distribute, or create derivative works based on our intellectual property without
                written permission.
            </p>

            <h2>8. Room Administration</h2>
            <p>
                Room creators have administrative control over their rooms, including the ability to:
            </p>
            <ul>
                <li>Set rooms as public or private</li>
                <li>Remove participants from rooms</li>
                <li>Modify room settings and layout</li>
                <li>Enable or disable features (chat, video, whiteboard)</li>
            </ul>
            <p>
                Room administrators are responsible for enforcing acceptable use within their rooms.
            </p>

            <h2>9. Service Availability</h2>
            <p>
                We strive for high availability but do not guarantee uninterrupted access. The Service may
                be temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
                We will make reasonable efforts to notify users of planned downtime.
            </p>

            <h2>10. Limitation of Liability</h2>
            <p>
                To the maximum extent permitted by law, Huddly shall not be liable for any indirect,
                incidental, special, consequential, or punitive damages, or any loss of profits or revenue,
                whether incurred directly or indirectly, or any loss of data, use, goodwill, or other
                intangible losses.
            </p>

            <h2>11. Termination</h2>
            <p>
                We may terminate or suspend your account and access to the Service immediately, without
                prior notice, if you breach these Terms. Upon termination, your right to use the Service
                will immediately cease. You may also delete your account at any time through your account settings.
            </p>

            <h2>12. Changes to Terms</h2>
            <p>
                We reserve the right to modify these Terms at any time. We will provide notice of material
                changes at least 30 days before they take effect. Continued use after changes constitutes
                acceptance of the new Terms.
            </p>

            <h2>13. Governing Law</h2>
            <p>
                These Terms shall be governed by and construed in accordance with applicable laws,
                without regard to conflict of law principles.
            </p>

            <h2>14. Contact</h2>
            <p>
                For questions about these Terms, contact us at <strong>legal@huddly.app</strong>.
            </p>
        </ContentPageLayout>
    );
}
