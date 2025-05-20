import React, { useState } from 'react';
import './FAQPage.css';
import { Link } from 'react-router-dom';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const faqs = [
  {
    question: "How to log in?",
    answer: "You can use your student account to log in."
  },
  {
    question: "Where to check my grades?",
    answer: "You can check your grades in your profile."
  },
  {
    question: "Where to find the classroom?",
    answer: "You can click your class schedul to find the classrom and building."
  }
];

const FAQPage = () => {
  const [openIndices, setOpenIndices] = useState([]);

  const handleToggle = idx => {
    setOpenIndices(prev =>
      prev.includes(idx)
        ? prev.filter(i => i !== idx)
        : [...prev, idx]
    );
  };

  return (
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
        {faqs.map((faq, idx) => (
          <div className={`faq-item-card${openIndices.includes(idx) ? ' open' : ''}`} key={idx}>
            <div
              className="faq-question-row"
              onClick={() => handleToggle(idx)}
            >
              <span className="faq-chevron">
                {openIndices.includes(idx) ? <FaChevronUp /> : <FaChevronDown />}
              </span>
              <span className="faq-question"><strong>{faq.question}</strong></span>
            </div>
            <div
              className={`faq-answer-animated${openIndices.includes(idx) ? ' show' : ''}`}
              style={{ maxHeight: openIndices.includes(idx) ? '200px' : '0px' }}
            >
              <div className="faq-answer-inner">{faq.answer}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQPage;
