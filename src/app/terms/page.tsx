import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/app/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Terms of Service — AI Protégé',
  description: 'The terms that govern use of AI Protégé.',
};

const updated = 'July 17, 2026';

const sections: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreement',
    content: (
      <p>
        These Terms of Service govern your access to AI Protégé, operated by Alimaa. By creating an
        account, purchasing a subscription, or using the service, you agree to these terms. If you do
        not agree, please do not use the service.
      </p>
    ),
  },
  {
    id: 'eligibility',
    title: 'Eligibility',
    content: (
      <>
        <p>You must be at least 13 years old to use AI Protégé.</p>
        <p>
          If you are under the age of legal majority where you live, you may use the service only with
          permission from a parent or legal guardian. That adult is responsible for your use of the
          service and your compliance with these terms.
        </p>
      </>
    ),
  },
  {
    id: 'service',
    title: 'The service',
    content: (
      <>
        <p>
          AI Protégé is an educational tool that helps you learn by teaching an AI student. You can
          provide a topic, URL, or PDF; draw and explain concepts; receive AI-generated questions and
          feedback; and review summaries of your learning sessions.
        </p>
        <p>
          We may improve, change, suspend, or discontinue parts of the service. We will try to give
          reasonable notice when a material change affects a paid feature, unless urgent security,
          legal, or technical reasons make notice impractical.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts and security',
    content: (
      <>
        <p>
          You must provide accurate account information and keep your sign-in method secure. You are
          responsible for activity under your account and should contact us promptly if you suspect
          unauthorized access.
        </p>
        <p>You may not share, sell, or transfer your account to another person.</p>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Your content',
    content: (
      <>
        <p>
          You retain ownership of the topics, source material, explanations, drawings, and other
          content you submit. You confirm that you have the rights needed to provide that content.
        </p>
        <p>
          You grant AI Protégé a limited license to host, copy, process, transmit, and display your
          content only as needed to operate, secure, support, and improve the service. This license
          ends when the content is deleted, except for temporary backups and copies we must keep for
          legal, security, or dispute-resolution purposes.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content: (
      <>
        <p>You agree that you will not:</p>
        <ul>
          <li>upload content that is unlawful, harmful, abusive, deceptive, or infringes another person’s rights;</li>
          <li>use the service to develop malware, facilitate wrongdoing, or harm another person;</li>
          <li>probe, disrupt, overload, or bypass the service’s security, access controls, or usage limits;</li>
          <li>access another user’s account or learning sessions without permission;</li>
          <li>scrape, resell, or commercially exploit the service except with our written permission; or</li>
          <li>misrepresent AI output as verified professional advice or guaranteed fact.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'ai',
    title: 'AI limitations',
    content: (
      <>
        <p>
          AI-generated questions, feedback, concepts, and summaries may be incomplete, inaccurate, or
          outdated. You should review important information against reliable sources.
        </p>
        <p>
          AI Protégé is designed for learning support. It does not provide medical, legal, financial,
          mental-health, or other professional advice, and it does not guarantee any learning outcome,
          grade, qualification, or result.
        </p>
      </>
    ),
  },
  {
    id: 'billing',
    title: 'Subscriptions and billing',
    content: (
      <>
        <p>
          Paid plans, prices, trial periods, renewal timing, and included features are shown before
          checkout. Unless cancelled before the trial or billing period ends, subscriptions renew
          automatically at the displayed interval. Polar processes checkout, payment methods, taxes,
          invoices, and subscription management.
        </p>
        <p>
          You can cancel through the billing portal. Cancellation normally takes effect at the end of
          the current paid or trial period. Refunds are provided where required by applicable law or
          expressly stated at checkout.
        </p>
      </>
    ),
  },
  {
    id: 'ownership',
    title: 'Our rights',
    content: (
      <p>
        AI Protégé and its software, design, branding, and original content are owned by Alimaa or the
        applicable licensors. These terms give you a limited, personal, non-exclusive, revocable right
        to use the service. They do not transfer any intellectual-property rights to you.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Suspension and termination',
    content: (
      <p>
        You may stop using the service at any time. We may restrict or terminate access when reasonably
        necessary to address a material breach, non-payment, security risk, unlawful conduct, harm to
        other users, or legal requirement. Where appropriate, we will give notice and an opportunity
        to resolve the issue.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers and liability',
    content: (
      <>
        <p>
          The service is provided on an “as is” and “as available” basis to the extent permitted by law.
          We do not promise uninterrupted availability, error-free operation, or that AI output will be
          accurate or suitable for a particular purpose.
        </p>
        <p>
          To the fullest extent permitted by law, Alimaa will not be liable for indirect, incidental,
          special, consequential, or punitive damages, or for lost data, profits, opportunities, or
          goodwill arising from use of the service. Nothing here limits liability or consumer rights
          that cannot legally be limited.
        </p>
      </>
    ),
  },
  {
    id: 'law',
    title: 'Governing law',
    content: (
      <p>
        These terms are governed by the laws of Mongolia. Courts with lawful jurisdiction in Mongolia
        may hear disputes, but this choice does not remove any mandatory consumer protection or other
        rights that apply to you under the law of the country where you live.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes and contact',
    content: (
      <>
        <p>
          We may update these terms as the service changes. We will post the updated date and provide
          additional notice when required by law. Continued use after the updated terms take effect
          means you accept them.
        </p>
        <p>
          Questions about these terms can be sent to{' '}
          <a href="mailto:alim888aa88@gmail.com">alim888aa88@gmail.com</a>.
        </p>
      </>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="LEGAL / TERMS"
      title="Terms of Service"
      intro="The ground rules for learning with AI Protégé, written to be read by humans."
      updated={updated}
      sections={sections}
    />
  );
}
