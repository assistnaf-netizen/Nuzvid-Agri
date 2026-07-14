import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import './Policy.css';

const CancellationPolicy = () => {
  useSEO({ title: 'Cancellation Policy', description: 'Cancellation Policy – Nuzvid Agri Farms' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-wrapper">
      <section className="policy-hero">
        <h1>Cancellation Policy</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &nbsp;|&nbsp; <span>Cancellation Policy</span>
        </div>
      </section>

      <div className="container">
        <div className="policy-content-wrapper">
          <p>
            At <strong>Nuzvid Agri Farms</strong>, we strive to provide exceptional service and ensure customer satisfaction. We understand that there may be situations where you need to cancel an order. Please carefully review our cancellation policy below:
          </p>

          <h2>1. Order Cancellation Window</h2>
          <ul>
            <li>You may cancel your order within <strong>1 hour</strong> of placing it.</li>
            <li>After this period, we may not be able to accept cancellation requests.</li>
          </ul>

          <h2>2. Cancellation Process</h2>
          <ul>
            <li>To cancel your order, please contact our customer support team at <strong>assist.naf@gmail.com</strong>.</li>
            <li>Kindly provide your order number and order details when making the request.</li>
            <li>Our support team will guide you through the cancellation process.</li>
          </ul>

          <h2>3. Refund Policy</h2>
          <ul>
            <li>If your order qualifies for cancellation within the specified time frame, a refund will be initiated to your original payment method.</li>
            <li>The refund will cover the full amount paid, including applicable taxes and shipping charges.</li>
            <li>Depending on your bank or payment provider, it may take up to <strong>7 business days</strong> for the refund to reflect in your account.</li>
          </ul>

          <h2>4. Non-Cancellable Items</h2>
          <p>Some products cannot be cancelled due to their nature or customization. These include, but are not limited to:</p>
          <ul>
            <li>Personalized or made-to-order items</li>
            <li>Perishable goods (such as fresh produce)</li>
          </ul>
          <p>Please review product details or contact customer support before placing such orders.</p>

          <h2>5. Cancellation After Shipment</h2>
          <ul>
            <li>Once your order has been shipped, it <strong>cannot</strong> be cancelled.</li>
            <li>For such cases, please refer to our <Link to="/refund-policy">Returns & Exchanges Policy</Link> for further guidance.</li>
          </ul>

          <h2>6. Changes to the Policy</h2>
          <ul>
            <li>Nuzvid Agri Farms reserves the right to modify or update this Cancellation Policy at any time.</li>
            <li>Any changes will be effective immediately upon being posted on our website.</li>
            <li>We recommend reviewing this policy periodically to stay informed.</li>
          </ul>

          <p style={{ marginTop: '30px' }}>
            By placing an order with Nuzvid Agri Farms, you acknowledge and agree to the terms outlined in this Cancellation Policy.
          </p>

          <h2>For further assistance, please contact us at:</h2>
          <p>
            📧 <strong>assist.naf@gmail.com</strong>
          </p>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicy;
