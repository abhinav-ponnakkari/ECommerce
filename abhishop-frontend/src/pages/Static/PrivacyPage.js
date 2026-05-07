import './Static.css';

export default function PrivacyPage() {
  return (
    <div className="page-wrapper">
      <div className="container static-page">
        <div className="static-hero static-hero--slate">
          <div className="static-hero-eyebrow">Legal</div>
          <h1 className="static-hero-title">Privacy Policy</h1>
          <p className="static-hero-sub">Last updated: January 1, 2024. Your privacy matters to us — here's how we handle your data.</p>
        </div>

        <div className="static-content">
          <h2>1. Information We Collect</h2>
          <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact our support team. This includes:</p>
          <ul>
            <li><strong>Account information:</strong> Name, email address, phone number, and password.</li>
            <li><strong>Payment information:</strong> Credit card details processed securely by our payment providers (we never store full card numbers).</li>
            <li><strong>Delivery information:</strong> Shipping addresses you save to your account.</li>
            <li><strong>Communications:</strong> Messages you send to our support team.</li>
          </ul>
          <p>We also collect information automatically when you use our Service, including device information, IP address, browser type, pages visited, and purchase history.</p>

          <h2>2. How We Use Your Information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Process and fulfill your orders, including sending confirmation and tracking emails.</li>
            <li>Manage your account and provide customer support.</li>
            <li>Personalize your shopping experience and show relevant product recommendations.</li>
            <li>Send promotional communications (with your consent, which you can withdraw anytime).</li>
            <li>Detect, prevent, and respond to fraud and security threats.</li>
            <li>Comply with legal obligations and enforce our Terms and Conditions.</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>We do not sell, trade, or rent your personal information to third parties for marketing purposes. We may share your information in the following limited circumstances:</p>
          <ul>
            <li><strong>Service providers:</strong> Shipping carriers, payment processors, and cloud infrastructure providers who help us operate our business.</li>
            <li><strong>Legal requirements:</strong> When required by law or to protect the rights and safety of AbhiShop and its users.</li>
            <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets, with appropriate confidentiality protections.</li>
          </ul>

          <h2>4. Cookies and Tracking</h2>
          <p>We use cookies and similar tracking technologies to improve your experience, remember your preferences, and analyze how our Service is used. You can control cookies through your browser settings, though disabling them may affect some features.</p>
          <p>We use:</p>
          <ul>
            <li><strong>Essential cookies:</strong> Required for the Service to function (e.g., your shopping cart, login session).</li>
            <li><strong>Analytics cookies:</strong> Help us understand how visitors interact with our site (anonymized data).</li>
            <li><strong>Preference cookies:</strong> Remember your settings and preferences.</li>
          </ul>

          <h2>5. Data Security</h2>
          <p>We implement industry-standard security measures to protect your personal information, including 256-bit SSL/TLS encryption for all data transmissions, hashed passwords using bcrypt, and regular security audits. However, no method of transmission over the internet is 100% secure.</p>

          <h2>6. Data Retention</h2>
          <p>We retain your personal information for as long as your account is active or as needed to provide our services. Order history is retained for 7 years as required by tax regulations. You may request deletion of your account at any time; certain data may be retained as required by law.</p>

          <h2>7. Your Rights</h2>
          <p>Depending on your location, you may have the following rights:</p>
          <ul>
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you.</li>
            <li><strong>Correction:</strong> Request that we correct inaccurate information.</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal retention requirements).</li>
            <li><strong>Portability:</strong> Request your data in a structured, machine-readable format.</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing emails at any time.</li>
          </ul>
          <p>To exercise any of these rights, contact us at <strong>privacy@abhishop.com</strong>.</p>

          <h2>8. Children's Privacy</h2>
          <p>Our Service is not directed to children under 13. We do not knowingly collect personal information from children under 13. If we learn that we have collected personal information from a child under 13, we will delete that information promptly.</p>

          <h2>9. Third-Party Links</h2>
          <p>Our Service may contain links to third-party websites. We are not responsible for the privacy practices of those sites. We encourage you to review the privacy policies of any third-party sites you visit.</p>

          <h2>10. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and sending an email notification. Your continued use of the Service after the changes take effect constitutes your acceptance of the new policy.</p>

          <h2>11. Contact Us</h2>
          <p>If you have questions about this Privacy Policy or our privacy practices, please contact our Data Protection Officer at <strong>privacy@abhishop.com</strong> or by mail at AbhiShop Inc., 123 Commerce Street, San Francisco, CA 94105.</p>
        </div>
      </div>
    </div>
  );
}
