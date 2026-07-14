import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import './Policy.css';

const ShippingPolicy = () => {
  useSEO({ title: 'Shipping & Delivery Policy', description: 'Shipping & Delivery Policy – Nuzvid Agri Farms' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-wrapper">
      <section className="policy-hero">
        <h1>Shipping & Delivery Policy</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &nbsp;|&nbsp; <span>Shipping Policy</span>
        </div>
      </section>

      <div className="container">
        <div className="policy-content-wrapper">
          <p>
            At <strong>Nuzvid Agri Farms</strong>, we aim to deliver your products safely and on time, ensuring a smooth and reliable shopping experience. Please review our Shipping & Delivery Policy carefully:
          </p>

          <h2>1. Domestic Shipping</h2>
          <ul>
            <li>For customers within India, orders are shipped through trusted courier partners such as Delhivery, Blue Dart, and India Post.</li>
            <li>The courier service is selected based on the service availability of your pincode.</li>
            <li>Orders are typically shipped within <strong>1–3 working days</strong> from confirmation and delivered within <strong>5–7 working days</strong> from dispatch, depending on your location.</li>
          </ul>

          <h2>2. International Shipping</h2>
          <ul>
            <li>For overseas orders, our official courier partner is DHL Express.</li>
            <li><strong>Estimated delivery timelines:</strong><br/>
              - Australia: up to 15 working days<br/>
              - Other countries: 5–7 working days
            </li>
          </ul>
          <p>
            <strong>Please note:</strong> Certain items may be restricted in your country. Local customs authorities may hold or destroy such shipments. Nuzvid Agri Farms holds no responsibility in such cases.
          </p>

          <h2>3. Shipping Timelines & Tracking</h2>
          <ul>
            <li>Orders are shipped within 7 working days or as per the delivery date agreed at the time of order confirmation.</li>
            <li>Customers will receive tracking details via email and/or SMS once the order is dispatched.</li>
            <li>In case of a package lost in transit, we will resend your order at no additional cost, as part of our delivery assurance.</li>
          </ul>

          <h2>4. Order Cancellations in Transit</h2>
          <ul>
            <li>Orders that are cancelled while in transit will be subject to Return-to-Origin (RTO) charges.</li>
            <li>Refunds (after RTO deduction) will be processed within 7–12 business days to the original payment method.</li>
            <li>If the shipment is resent upon customer request, reshipping charges will apply. If cancelled again, both reshipping and RTO charges will be deducted from the refund.</li>
          </ul>

          <h2>5. Delivery Address Policy</h2>
          <ul>
            <li>Orders will be delivered only to the registered address provided at checkout.</li>
            <li>Nuzvid Agri Farms is not responsible for delivery failures due to incorrect or incomplete addresses entered by the customer.</li>
          </ul>

          <h2>6. Packaging Standards</h2>
          <p>
            We follow strict quality and safety measures to ensure your products are packaged securely and reach you in perfect condition.
          </p>

          <h2>7. Payments</h2>
          <ul>
            <li>We use Razorpay and other secure online payment gateways for fast and safe transactions.</li>
            <li>All major Credit Cards, Debit Cards, UPI, and Net Banking are accepted.</li>
            <li>Any payment issues must be resolved directly with your bank or payment gateway provider. Nuzvid Agri Farms is responsible only once payment has been successfully captured into our account.</li>
          </ul>

          <h2>8. Communication Policy</h2>
          <ul>
            <li>Order confirmations and shipping updates are sent to the email ID and phone number provided at checkout.</li>
            <li>Nuzvid Agri Farms is not responsible if incorrect details are entered by the customer.</li>
            <li>If you receive communications not intended for you due to an error in email ID/phone number provided by another customer, kindly notify us at <strong>assist.naf@gmail.com</strong> within 24 hours. We will update and correct the details within 72 hours.</li>
          </ul>

          <h2>9. Disclaimer</h2>
          <ul>
            <li>Deliveries to urban areas are usually handled by major courier agencies.</li>
            <li>Deliveries to remote or rural areas may be shipped via India Speed Post or local courier partners, which may take additional time.</li>
          </ul>

          <h2>10. Service on Holidays</h2>
          <p>Please note that shipping and deliveries are not processed on:</p>
          <ul>
            <li>National holidays</li>
            <li>Major religious festivals</li>
            <li>Certain local holidays (depending on courier partner availability)</li>
          </ul>

          <p style={{ marginTop: '30px', fontWeight: 'bold' }}>
            📌 At Nuzvid Agri Farms, customer satisfaction is our priority. We continuously strive to provide a safe, transparent, and reliable shipping experience.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;
