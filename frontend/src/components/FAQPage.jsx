import React, { useState, useEffect } from 'react';
import './FAQPage.css';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import Banner from './Banner';
import { faq } from '../api'; // Import the FAQ function from your API

const FAQPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openIndices, setOpenIndices] = useState([]);

  // Fetch FAQ data from API
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        setLoading(true);
        const response = await faq();

        // Extract FAQlist from response and map to expected format
        const faqData = response.data?.FAQList || [];
        const mappedFaqs = faqData.map(item => ({
          question: item.Question,
          answer: item.Answer
        }));

        setFaqs(mappedFaqs);
        setError(null);
      } catch (err) {
        console.error('Error fetching FAQs:', err);
        setError(`Failed to load FAQs: ${err.message || 'Please try again later.'}`);
        setFaqs([]); // Ensure it's always an array
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  const handleToggle = idx => {
    setOpenIndices(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  // Loading state
  if (loading) {
    return (
      <>
        <Banner />
        <div className="faq-page-outer">
          <div className="faq-title-bg">
            <div className="faq-title-row">
              <span className="faq-title-main">FAQ</span>
              <span className="faq-title-sub">- FREQUENTLY ASKED QUESTIONS</span>
            </div>
          </div>
          <div className="faq-breadcrumb">
            <Link to="/home" className="faq-home-link no-underline">Home page</Link> / FAQ
          </div>
          <div className="faq-list">
            <div className="faq-loading">Loading FAQs...</div>
          </div>
        </div>
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <>
        <Banner />
        <div className="faq-page-outer">
          <div className="faq-title-bg">
            <div className="faq-title-row">
              <span className="faq-title-main">FAQ</span>
              <span className="faq-title-sub">- FREQUENTLY ASKED QUESTIONS</span>
            </div>
          </div>
          <div className="faq-breadcrumb">
            <Link to="/home" className="faq-home-link no-underline">Home page</Link> / FAQ
          </div>
          <div className="faq-list">
            <div className="faq-error">{error}</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Banner />
      <div className="faq-page-outer">
        <div className="faq-title-bg">
          <div className="faq-title-row">
            <span className="faq-title-main">FAQ</span>
            <span className="faq-title-sub">- FREQUENTLY ASKED QUESTIONS</span>
          </div>
        </div>
        <div className="faq-breadcrumb">
          <Link to="/home" className="faq-home-link no-underline">Home page</Link> / FAQ
        </div>
        <div className="faq-list">
          {!Array.isArray(faqs) || faqs.length === 0 ? (
            <div className="faq-empty">No FAQs available at the moment.</div>
          ) : (
            faqs.map((faqItem, idx) => (
              <div className={`faq-item-card${openIndices.includes(idx) ? ' open' : ''}`} key={idx}>
                <div
                  className="faq-question-row"
                  onClick={() => handleToggle(idx)}
                >
                  <span className="faq-chevron">
                    {openIndices.includes(idx) ? <FaChevronUp /> : <FaChevronDown />}
                  </span>
                  <span className="faq-question"><strong>{faqItem.question}</strong></span>
                </div>
                <div
                  className={`faq-answer-animated${openIndices.includes(idx) ? ' show' : ''}`}
                  style={{ maxHeight: openIndices.includes(idx) ? '200px' : '0px' }}
                >
                  <div className="faq-answer-inner">{faqItem.answer}</div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default FAQPage;