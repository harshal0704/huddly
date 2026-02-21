import ContentPageLayout from "@/components/shared/ContentPageLayout";

export default function PrivacyPage() {
    return (
        <ContentPageLayout
            title="Privacy Policy"
            subtitle="How we collect, use, and protect your personal information."
            badge="Legal"
            lastUpdated="February 21, 2026"
        >
            <h2>1. Information We Collect</h2>

            <h3>1.1 Account Information</h3>
            <p>
                When you create a Huddly account, we collect your name, email address, and profile picture.
                If you sign up via a third-party service (Google, GitHub), we receive your basic profile
                information from that provider.
            </p>

            <h3>1.2 Usage Data</h3>
            <p>
                We automatically collect certain information when you use Huddly, including:
            </p>
            <ul>
                <li>Device type, browser version, and operating system</li>
                <li>IP address and approximate geographic location (country-level)</li>
                <li>Pages visited, time spent in rooms, and feature usage</li>
                <li>Crash reports and performance metrics</li>
            </ul>

            <h3>1.3 Communication Data</h3>
            <p>
                Chat messages within rooms are processed in real-time and are <strong>not stored on our servers</strong>
                after the session ends. Audio and video streams are transmitted peer-to-peer via WebRTC and
                are <strong>never recorded or stored</strong> by Huddly unless you explicitly enable recording.
            </p>

            <h3>1.4 Cookies</h3>
            <p>
                We use essential cookies for authentication and session management. We also use analytics
                cookies to understand how our platform is used. You can disable non-essential cookies in
                your browser settings.
            </p>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Provide, maintain, and improve the Huddly platform</li>
                <li>Authenticate your identity and secure your account</li>
                <li>Send important service notifications (security alerts, account updates)</li>
                <li>Analyze usage patterns to improve performance and features</li>
                <li>Prevent abuse, fraud, and violations of our Terms of Service</li>
            </ul>
            <p>
                We <strong>do not</strong> sell your personal information to third parties. We <strong>do not</strong> use
                your data for targeted advertising.
            </p>

            <h2>3. Data Sharing</h2>
            <p>We share your information only in these circumstances:</p>
            <ul>
                <li><strong>With your consent:</strong> When you explicitly authorize sharing</li>
                <li><strong>Service providers:</strong> We use trusted third parties for hosting (Vercel), database (Supabase), and analytics. These providers are bound by data processing agreements.</li>
                <li><strong>Legal requirements:</strong> When required by law, subpoena, or court order</li>
                <li><strong>Safety:</strong> To protect the rights, property, or safety of Huddly, our users, or the public</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
                We implement industry-standard security measures to protect your data:
            </p>
            <ul>
                <li>All data in transit is encrypted using TLS 1.3</li>
                <li>Passwords are hashed using bcrypt with salt rounds</li>
                <li>Database access is restricted and audited</li>
                <li>Regular security assessments and penetration testing</li>
                <li>WebRTC streams use DTLS-SRTP encryption</li>
            </ul>

            <h2>5. Data Retention</h2>
            <p>
                We retain your account data for as long as your account is active. If you delete your
                account, we will remove your personal data within 30 days. Some anonymized usage data
                may be retained for analytics purposes.
            </p>

            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
                <li><strong>Access</strong> your personal data we hold</li>
                <li><strong>Correct</strong> inaccurate information</li>
                <li><strong>Delete</strong> your account and associated data</li>
                <li><strong>Export</strong> your data in a portable format</li>
                <li><strong>Withdraw consent</strong> for non-essential data processing</li>
            </ul>
            <p>
                To exercise these rights, email us at <strong>privacy@huddly.app</strong>.
            </p>

            <h2>7. Children&apos;s Privacy</h2>
            <p>
                Huddly is not intended for children under 13. We do not knowingly collect personal
                information from children under 13. If we learn that we have collected data from a child
                under 13, we will promptly delete it.
            </p>

            <h2>8. Changes to This Policy</h2>
            <p>
                We may update this Privacy Policy from time to time. We will notify you of material changes
                via email or a prominent notice on our platform. Your continued use of Huddly after changes
                constitutes acceptance of the updated policy.
            </p>

            <h2>9. Contact Us</h2>
            <p>
                If you have questions about this Privacy Policy, contact us at <strong>privacy@huddly.app</strong>.
            </p>
        </ContentPageLayout>
    );
}
