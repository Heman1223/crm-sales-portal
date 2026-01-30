import { useState } from 'react';
import {
    HelpCircle,
    MessageCircle,
    Book,
    Mail,
    Phone,
    ChevronDown,
    ChevronUp,
    ExternalLink
} from 'lucide-react';

const HelpPage = () => {
    const [openFaq, setOpenFaq] = useState(null);

    const faqs = [
        {
            question: 'How do I log a new sale?',
            answer: 'Navigate to "My Sales" or "All Sales" page and click the "Log New Sale" button. Fill in the client name, service, amount, and city. The commission will be calculated automatically at 10% of the sale amount.'
        },
        {
            question: 'How are commissions calculated?',
            answer: 'Commissions are automatically calculated at 10% of each sale amount. You can view your total commissions on the Dashboard or the Commissions page. Commissions are marked as "Paid" when the sale status is "Completed".'
        },
        {
            question: 'How do I track my monthly targets?',
            answer: 'Visit the "Targets" page to see your current month\'s target and progress. The progress bar shows how much of your target you\'ve achieved. Targets are set by your admin.'
        },
        {
            question: 'Can I edit a sale after submitting?',
            answer: 'Sellers can only edit sales with "Pending" status. Once a sale is moved to "Processing" or "Completed" by an admin, it becomes read-only. Admins can edit sales at any status.'
        },
        {
            question: 'How do I view my performance ranking?',
            answer: 'Go to the "Performance" page to see the leaderboard. Your position is highlighted, and you can see how you compare to other sellers based on total revenue generated.'
        },
        {
            question: 'How do I export reports?',
            answer: 'Admins can export data from the "Reports" page. Select the report type (Sales, Cities, or Performers), set the date range, and click "Export CSV". The file will download automatically.'
        },
        {
            question: 'How do I change my password?',
            answer: 'Go to Settings → Security → Change Password. Enter your current password, then your new password twice to confirm. Click "Change Password" to save.'
        },
        {
            question: 'What do the sale statuses mean?',
            answer: 'Pending: Sale is logged but not yet verified. Processing: Sale is being processed/verified. Completed: Sale is confirmed and commission is paid. Cancelled: Sale was cancelled or invalid.'
        }
    ];

    const toggleFaq = (index) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    return (
        <div>
            <div className="page-header">
                <h1>Help & Support</h1>
                <p>Find answers to common questions and get support</p>
            </div>

            {/* Quick Links */}
            <div className="help-grid">
                <div className="help-card">
                    <div className="help-card-icon">
                        <Book />
                    </div>
                    <h3>User Guide</h3>
                    <p>Learn how to use all features of the CRM</p>
                    <button className="btn btn-secondary btn-sm">
                        View Guide <ExternalLink size={14} />
                    </button>
                </div>

                <div className="help-card">
                    <div className="help-card-icon">
                        <MessageCircle />
                    </div>
                    <h3>Contact Support</h3>
                    <p>Get help from our support team</p>
                    <a href="mailto:support@salesedge.com" className="btn btn-secondary btn-sm">
                        <Mail size={14} /> Email Support
                    </a>
                </div>

                <div className="help-card">
                    <div className="help-card-icon">
                        <Phone />
                    </div>
                    <h3>Call Us</h3>
                    <p>Speak directly with support</p>
                    <a href="tel:+919876543210" className="btn btn-secondary btn-sm">
                        <Phone size={14} /> +91 98765 43210
                    </a>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="card" style={{ marginTop: '24px' }}>
                <div className="card-header">
                    <h3 className="card-title">
                        <HelpCircle size={20} style={{ marginRight: '8px' }} />
                        Frequently Asked Questions
                    </h3>
                </div>
                <div className="card-body" style={{ padding: 0 }}>
                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div key={index} className={`faq-item ${openFaq === index ? 'open' : ''}`}>
                                <button
                                    className="faq-question"
                                    onClick={() => toggleFaq(index)}
                                >
                                    <span>{faq.question}</span>
                                    {openFaq === index ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openFaq === index && (
                                    <div className="faq-answer">
                                        <p>{faq.answer}</p>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Still Need Help */}
            <div className="help-contact-card">
                <h3>Still need help?</h3>
                <p>Our support team is available Monday to Friday, 9 AM to 6 PM IST</p>
                <div className="help-contact-actions">
                    <a href="mailto:support@salesedge.com" className="btn btn-primary">
                        <Mail size={18} />
                        Send Email
                    </a>
                    <a href="tel:+919876543210" className="btn btn-secondary">
                        <Phone size={18} />
                        Call Support
                    </a>
                </div>
            </div>

        </div>
    );
};

export default HelpPage;
