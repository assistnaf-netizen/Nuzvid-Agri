import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useSEO from '../hooks/useSEO';
import './Faqs.css';

const faqsData = [
  {
    question: "How can I contact your customer service team?",
    answer: "For customer service inquiries, please email us at assist.naf@gmail.com or call us at +91 98853 13459."
  },
  {
    question: "I emailed your customer service team. When will I receive a response?",
    answer: "We aim to respond to all customer inquiries within 24 to 48 hours during regular business days."
  },
  {
    question: "How long will shipping take?",
    answer: "Domestic orders within India typically take 5-7 working days. International orders can take between 5-15 working days depending on the destination."
  },
  {
    question: "Do you offer returns and refunds?",
    answer: "Since our products are natural and perishable, we are unable to accept returns or provide refunds. However, we do offer exchanges if you receive a damaged or incorrect product."
  },
  {
    question: "What if I receive a damaged product?",
    answer: "Please email us at assist.naf@gmail.com within 1 day of receiving your order with clear photos and videos of the unopened product, and our team will arrange an exchange."
  },
  {
    question: "Are customs duties and taxes included in the product price?",
    answer: "For international shipments, local customs duties and taxes may apply upon arrival. These charges are the responsibility of the customer and are not included in our pricing."
  },
  {
    question: "Do you offer discounts and promotions?",
    answer: "Yes, we occasionally run special discounts and promotions! Subscribe to our newsletter at the bottom of the page to stay updated on our latest offers."
  },
  {
    question: "Why hasn't my tracking status been updated?",
    answer: "Tracking statuses can sometimes take 24-48 hours to update after the courier picks up the package. If it hasn't updated after a few days, please reach out to our support team."
  },
  {
    question: "Can I change or cancel my order?",
    answer: "You may cancel or change your order within 1 hour of placing it. Once the order has been processed or shipped, it cannot be cancelled."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We use secure payment gateways (like Razorpay) and accept all major Credit Cards, Debit Cards, UPI, and Net Banking."
  }
];

const Faqs = () => {
  useSEO({ title: 'FAQs', description: 'Frequently Asked Questions – Nuzvid Agri Farms' });
  const [activeIndex, setActiveIndex] = useState(0); // First item open by default

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faqs-page-wrapper">
      <section className="faqs-hero">
        <h1>FAQs</h1>
        <div className="breadcrumb">
          <Link to="/">Home</Link> &nbsp;|&nbsp; <span>FAQs</span>
        </div>
      </section>

      <div className="container">
        <div className="faqs-content-wrapper">
          
          <div className="faqs-accordion">
            {faqsData.map((faq, index) => (
              <div 
                key={index} 
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              >
                <div 
                  className="faq-question" 
                  onClick={() => toggleAccordion(index)}
                >
                  <span>{faq.question}</span>
                  <div className="faq-icon">
                    {activeIndex === index ? '-' : '+'}
                  </div>
                </div>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="faqs-support-section">
            <h2>For furthermore help... Contact with our support team.</h2>
            <Link to="/contact" className="faqs-contact-btn">Contact Us</Link>
            <div className="faqs-phone">
              <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 512 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M493.4 24.6l-104-24c-11.3-2.6-22.9 3.3-27.5 13.9l-48 112c-4.2 9.8-1.4 21.3 6.9 28l60.6 49.6c-36 76.7-98.9 140.5-177.2 177.2l-49.6-60.6c-6.8-8.3-18.2-11.1-28-6.9l-112 48C3.9 366.5-2 378.1.6 389.4l24 104C27.1 504.2 36.7 512 48 512c256.1 0 464-207.5 464-464 0-11.2-7.7-20.9-18.6-23.4z"></path></svg>
              +91 98853 13459
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Faqs;
