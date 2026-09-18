import React from 'react';
import FAQPage from '@/components/pageComponents/dashboard/admin/question/FAQPage';
import PublicNavigation from '@/components/pageComponents/publicComponent/publicNavigation/page';
import Footer from '@/components/pageComponents/publicComponent/footer/page';

const FAQ: React.FC = () => {
  const faqs = [
    {
      id: '1',
      question: 'How do I get started with your service?',
      answer: 'Getting started is easy! Simply sign up for an account on our website, complete your profile, and you can begin using our services immediately. We offer a guided onboarding process to help you every step of the way.'
    },
    {
      id: '2',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. For enterprise customers, we also offer invoice-based billing with net-30 terms.'
    },
    {
      id: '3',
      question: 'Is there a free trial available?',
      answer: 'Yes, we offer a 14-day free trial with full access to all features. No credit card is required to start your trial. After 14 days, you can choose a plan that fits your needs.'
    },
    {
      id: '4',
      question: 'How does your pricing work?',
      answer: 'We offer tiered pricing based on usage and features needed. Our plans start at $29/month for basic features and scale up to enterprise solutions with custom pricing. You can upgrade, downgrade, or cancel at any time.'
    },
    {
      id: '5',
      question: 'What kind of support do you offer?',
      answer: 'We provide 24/5 email support with a guaranteed response time of under 4 hours. Premium subscribers get access to live chat and phone support. All users have access to our comprehensive knowledge base and community forums.'
    },
  ];

  return (
    <>
      <div className="bg-[#035140]">
        <PublicNavigation />
      </div>
      <FAQPage faqs={faqs} />
       <Footer />
    </>
  );
};

export default FAQ;