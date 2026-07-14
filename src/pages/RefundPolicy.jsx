import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import './RefundPolicy.css';

const RefundPolicy = () => {
  useSEO({ title: 'Refund Policy', description: 'Returns, Refunds & Exchanges Policy – Nuzvid Agri Farms' });

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="policy-page-wrapper">
      <section className="policy-hero">
        <h1>Refund Policy</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &nbsp;|&nbsp; <span>Refund Policy</span>
        </div>
      </section>

      <div className="container">
        <div className="policy-content-wrapper">
          <h2>DOES Nuzvid Agri Farms PROVIDE RETURNS AND REFUNDS ON ITS PRODUCTS?</h2>
          <p>
            At <strong>Nuzvid Agri Farms</strong>, we take great care in crafting and delivering our products with the highest quality standards. Since our products are natural, perishable, and carefully packaged, <strong>we are unable to accept returns or provide refunds.</strong>
          </p>
          <p>
            However, to ensure your satisfaction, we do offer product exchanges under specific circumstances.
          </p>

          <h2>Eligibility for Exchange</h2>
          <p>You may request an exchange if:</p>
          <ul>
            <li>You have received a damaged product.</li>
            <li>You have received an incorrect item in your order.</li>
          </ul>

          <h2>Steps to Request an Exchange</h2>
          
          <h3>1. Contact Us Promptly</h3>
          <p>Send an email to <strong>assist.naf@gmail.com</strong> within <strong>1 day</strong> of receiving your order.</p>
          
          <h3>2. Provide Proof</h3>
          <p>Share clear videos and pictures of the product, ensuring that:</p>
          <ul>
            <li>The product is unopened.</li>
            <li>All original packaging is intact.</li>
            <li>The damage or incorrect item is clearly visible.</li>
          </ul>

          <h3>3. Review & Inspection</h3>
          <p>Once we receive your photos and videos, our team will review them carefully. Exchanges will be approved only if the product meets the above criteria.</p>

          <h2>Important Notes</h2>
          <ul>
            <li>We do not accept product returns of any kind.</li>
            <li>We do not issue refunds.</li>
            <li>Exchanges are issued only after verification and approval by our quality team.</li>
          </ul>

          <h2>Need Help?</h2>
          <p>
            If you have any questions, concerns, or require assistance with your order, please do not hesitate to reach out to us at <strong>assist.naf@gmail.com</strong>. Our team will be happy to assist you.
          </p>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;
