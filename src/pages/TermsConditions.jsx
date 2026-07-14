import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import './Policy.css';

const TermsConditions = () => {
  useSEO({ title: 'Terms & Conditions', description: 'Terms & Conditions – Nuzvid Agri Farms' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-wrapper">
      <section className="policy-hero">
        <h1>Terms & Conditions</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &nbsp;|&nbsp; <span>Terms & Conditions</span>
        </div>
      </section>

      <div className="container">
        <div className="policy-content-wrapper">
          <p>
            This website is operated by <strong>Nuzvid Agri Farms</strong>. Throughout the site, the terms “we”, “us”, and “our” refer to Nuzvid Agri Farms, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
          </p>
          <p>
            By visiting our website and/or purchasing from us, you engage in our “Service” and agree to be bound by these Terms & Conditions (“Terms of Service”, “Terms”), including any additional terms and policies referenced herein or available by hyperlink. These Terms apply to all users of the site, including but not limited to browsers, vendors, customers, merchants, and contributors of content.
          </p>
          <p>
            Please read these Terms carefully before accessing or using our website. If you do not agree to all the terms and conditions, you may not access the website or use any services. Acceptance is expressly limited to these Terms of Service.
          </p>
          <p>
            Any new features or tools added to the store will also be subject to these Terms. We reserve the right to update or change them at any time by posting updates here. Continued use of our website constitutes acceptance of such changes.
          </p>
          <p>
            Our store is hosted on Shopify Inc., which provides us with the e-commerce platform to sell our products and services to you.
          </p>

          <h2>SECTION 1 – ONLINE STORE TERMS</h2>
          <ul>
            <li>You must be at least the age of majority in your state or province of residence, or you have given consent for your minor dependents to use this site.</li>
            <li>You may not use our products for any unlawful purpose or violate any laws in your jurisdiction (including copyright laws).</li>
            <li>You must not transmit any destructive code, viruses, or worms.</li>
            <li>Any breach of these Terms will result in immediate termination of your Services.</li>
          </ul>

          <h2>SECTION 2 – GENERAL CONDITIONS</h2>
          <ul>
            <li>We reserve the right to refuse service to anyone for any reason at any time.</li>
            <li>Content (excluding payment details) may be transferred unencrypted over various networks. Payment information is always encrypted during transfer.</li>
            <li>You may not reproduce, duplicate, copy, sell, resell, or exploit any part of the Service without our written permission.</li>
            <li>Headings used in this agreement are for convenience only and do not limit the Terms.</li>
          </ul>

          <h2>SECTION 3 – ACCURACY, COMPLETENESS & TIMELINESS OF INFORMATION</h2>
          <ul>
            <li>We are not responsible if the information provided on this site is inaccurate, incomplete, or outdated.</li>
            <li>The material on this site is for general information only and should not be relied upon solely for decision-making.</li>
            <li>We reserve the right to modify contents at any time, but we are not obligated to update information.</li>
          </ul>

          <h2>SECTION 4 – MODIFICATIONS TO THE SERVICE & PRICES</h2>
          <ul>
            <li>Prices are subject to change without notice.</li>
            <li>We may modify or discontinue the Service at any time without notice.</li>
            <li>We are not liable for any modifications, price changes, suspensions, or discontinuations.</li>
          </ul>

          <h2>SECTION 5 – PRODUCTS OR SERVICES</h2>
          <ul>
            <li>Certain products/services may be available exclusively online and in limited quantities.</li>
            <li>Product images are displayed as accurately as possible, but we cannot guarantee your monitor’s accuracy.</li>
            <li>We reserve the right to limit sales, quantities, or discontinue products at our discretion.</li>
            <li>Product descriptions and pricing are subject to change without notice.</li>
            <li>We do not guarantee that products or services will meet your expectations.</li>
          </ul>

          <h2>SECTION 6 – ACCURACY OF BILLING & ACCOUNT INFORMATION</h2>
          <ul>
            <li>We reserve the right to refuse or cancel orders.</li>
            <li>Restrictions may apply to orders using the same account, credit card, or billing/shipping address.</li>
            <li>Customers must provide accurate and up-to-date account and billing information.</li>
            <li>For more details, please review our Returns & Exchanges Policy.</li>
          </ul>

          <h2>SECTION 7 – OPTIONAL TOOLS</h2>
          <ul>
            <li>We may provide access to third-party tools “as is” and “as available,” without warranties or liability.</li>
            <li>Use of such tools is at your own risk, and you must review terms set by third-party providers.</li>
          </ul>

          <h2>SECTION 8 – THIRD-PARTY LINKS</h2>
          <ul>
            <li>Some content, products, or services may link to third-party websites.</li>
            <li>We are not responsible for evaluating or guaranteeing third-party content or services.</li>
            <li>Complaints or issues with third-party products/services must be directed to the third party.</li>
          </ul>

          <h2>SECTION 9 – USER COMMENTS, FEEDBACK & OTHER SUBMISSIONS</h2>
          <ul>
            <li>By submitting comments, suggestions, or ideas, you grant us the right to edit, use, or distribute them without obligation to compensate you.</li>
            <li>We may remove or edit content that violates laws or these Terms.</li>
            <li>You agree not to post unlawful, offensive, defamatory, or harmful content.</li>
          </ul>

          <h2>SECTION 10 – PERSONAL INFORMATION</h2>
          <p>
            Your submission of personal information is governed by our <Link to="/privacy-policy">Privacy Policy</Link>.
          </p>

          <h2>SECTION 11 – ERRORS, INACCURACIES & OMISSIONS</h2>
          <ul>
            <li>Occasionally, there may be errors in product descriptions, pricing, promotions, or availability.</li>
            <li>We reserve the right to correct errors, update information, or cancel orders if details are inaccurate.</li>
          </ul>

          <h2>SECTION 12 – PROHIBITED USES</h2>
          <p>You are prohibited from using the site or its content for:</p>
          <ul>
            <li>Unlawful purposes</li>
            <li>Violating laws/regulations</li>
            <li>Infringing intellectual property rights</li>
            <li>Uploading malicious code</li>
            <li>Harassing, abusing, or discriminating against others</li>
            <li>Collecting personal data unlawfully</li>
            <li>Spamming, phishing, or scraping</li>
            <li>Any obscene, immoral, or harmful purpose</li>
          </ul>
          <p>Violation of these terms may result in termination of services.</p>

          <h2>SECTION 13 – DISCLAIMER OF WARRANTIES & LIMITATION OF LIABILITY</h2>
          <ul>
            <li>We do not guarantee uninterrupted, timely, or error-free services.</li>
            <li>Services and products are provided “as is” and “as available.”</li>
            <li>Nuzvid Agri Farms and its affiliates shall not be liable for damages arising from the use of services or products, except as limited by applicable law.</li>
          </ul>

          <h2>SECTION 14 – INDEMNIFICATION</h2>
          <p>
            You agree to indemnify and hold harmless Nuzvid Agri Farms, its affiliates, employees, and partners against claims arising from your violation of these Terms or applicable laws.
          </p>

          <h2>SECTION 15 – SEVERABILITY</h2>
          <p>
            If any provision of these Terms is found unlawful or unenforceable, the remaining provisions will continue to be valid and enforceable.
          </p>

          <h2>SECTION 16 – TERMINATION</h2>
          <ul>
            <li>These Terms remain effective until terminated by either party.</li>
            <li>We may terminate your access to our Services at any time if you fail to comply with these Terms.</li>
          </ul>

          <h2>SECTION 17 – ENTIRE AGREEMENT</h2>
          <p>
            These Terms, along with any posted policies, constitute the entire agreement between you and Nuzvid Agri Farms.
          </p>

          <h2>SECTION 18 – GOVERNING LAW</h2>
          <p>
            These Terms and any agreements for Services shall be governed by and construed in accordance with the laws of India.
          </p>

          <h2>SECTION 19 – CHANGES TO TERMS OF SERVICE</h2>
          <p>
            We may update or replace these Terms at any time by posting changes on this page. Your continued use of our website constitutes acceptance of such changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions;
