import type { Metadata } from 'next';
import { LegalPage, type LegalSection } from '@/app/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Privacy Policy — AI Protégé',
  description: 'How AI Protégé collects, uses, shares, and protects personal information.',
};

const updated = 'July 17, 2026';

const sections: LegalSection[] = [
  {
    id: 'scope',
    title: 'Who we are',
    content: (
      <p>
        This policy explains how AI Protégé, operated by Alimaa in Mongolia, handles personal
        information when you visit or use the service. Questions and privacy requests can be sent to{' '}
        <a href="mailto:alim888aa88@gmail.com">alim888aa88@gmail.com</a>.
      </p>
    ),
  },
  {
    id: 'collection',
    title: 'Information we collect',
    content: (
      <>
        <p>Depending on how you use AI Protégé, we collect:</p>
        <ul>
          <li>account information, such as your email address, account identifier, and sign-in details managed by Clerk;</li>
          <li>learning content, including topics, source URLs, extracted PDF or webpage text, concepts, explanations, canvas drawings, AI conversations, and summaries;</li>
          <li>billing records, such as your Polar customer identifier, plan, subscription status, trial dates, and renewal status—we do not receive your full card number;</li>
          <li>technical and usage information, such as pages visited, browser or device information, approximate region, timestamps, IP-derived security data, and error logs;</li>
          <li>support communications you send to us; and</li>
          <li>for the public demo, a randomly generated browser identifier that is hashed for daily usage limits, plus any explanation or drawing you submit.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'local-storage',
    title: 'Cookies and local storage',
    content: (
      <>
        <p>
          Clerk uses essential cookies or similar technology to keep you signed in and protect your
          account. AI Protégé uses local storage to remember your theme choice and the public demo’s
          anonymous browser identifier. We also use temporary browser session storage to move lesson
          content between teaching and completion pages more quickly. That cache normally clears after
          summary generation, when you delete the lesson, or when the browser session ends.
        </p>
        <p>
          Vercel Analytics helps us understand page usage and performance. We do not use advertising
          cookies, run targeted advertising, or sell personal information.
        </p>
      </>
    ),
  },
  {
    id: 'use',
    title: 'How we use information',
    content: (
      <>
        <p>We use information to:</p>
        <ul>
          <li>create and secure accounts, provide lessons, save progress, and manage subscriptions;</li>
          <li>extract concepts, retrieve relevant source passages, and generate AI questions, hints, feedback, and summaries;</li>
          <li>operate the public demo and enforce abuse and spending limits;</li>
          <li>support users, troubleshoot errors, monitor reliability, and improve the service;</li>
          <li>prevent fraud, misuse, security incidents, and violations of our terms; and</li>
          <li>comply with legal obligations and resolve disputes.</li>
        </ul>
        <p>
          Where applicable, we rely on performance of our contract with you, our legitimate interests
          in operating and protecting the service, your consent, and compliance with law.
        </p>
      </>
    ),
  },
  {
    id: 'ai',
    title: 'AI processing',
    content: (
      <>
        <p>
          When you use AI features, relevant learning content may be sent to OpenAI through its API.
          This can include your explanation, source passages, dialogue history, and an exported image
          of the canvas. OpenAI processes that information to return the requested output under its
          business service terms and data controls.
        </p>
        <p>
          Please avoid submitting secrets, financial account details, health records, or other highly
          sensitive personal information that is unnecessary for your lesson.
        </p>
      </>
    ),
  },
  {
    id: 'sharing',
    title: 'Service providers and sharing',
    content: (
      <>
        <p>We share information only as needed with providers that help operate AI Protégé:</p>
        <ul>
          <li><a href="https://clerk.com/legal/privacy">Clerk</a> for authentication and account management;</li>
          <li><a href="https://www.convex.dev/legal/privacy">Convex</a> for application hosting, database storage, and backend functions;</li>
          <li><a href="https://openai.com/policies/privacy-policy/">OpenAI</a> for AI generation, vision processing, and embeddings;</li>
          <li><a href="https://polar.sh/legal/privacy-policy">Polar</a> for checkout, subscriptions, invoices, and tax handling; and</li>
          <li><a href="https://vercel.com/legal/privacy-notice">Vercel</a> for web hosting and analytics.</li>
        </ul>
        <p>
          We may also disclose information when required by law, to protect users or the service, or as
          part of a merger, financing, acquisition, or transfer of the service. We do not sell or rent
          personal information.
        </p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'Retention and deletion',
    content: (
      <>
        <p>
          We keep account, learning, and subscription information while your account is active and for
          as long as reasonably needed to provide the service, meet legal or accounting duties, resolve
          disputes, prevent abuse, and maintain security.
        </p>
        <p>
          You can delete individual learning sessions from the dashboard. To request account-level
          deletion, email us. Some information may remain temporarily in backups or be retained where
          law, fraud prevention, billing records, or legitimate legal claims require it.
        </p>
        <p>
          Public-demo usage claims become invalid after 24 hours and are removed during later demo
          traffic. Aggregated daily usage counts do not identify an individual.
        </p>
      </>
    ),
  },
  {
    id: 'transfers',
    title: 'International transfers',
    content: (
      <p>
        AI Protégé is operated from Mongolia and uses providers that may process information in the
        United States and other countries. Those countries may have different privacy laws from where
        you live. Where required, we and our providers use legally recognized safeguards for these
        transfers.
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <p>
        We use reasonable technical and organizational measures designed to protect information,
        including authenticated access and access controls around saved lessons. No online service can
        guarantee absolute security, so please use a secure sign-in method and avoid unnecessary
        sensitive information in learning content.
      </p>
    ),
  },
  {
    id: 'rights',
    title: 'Your choices and rights',
    content: (
      <>
        <p>
          Depending on where you live, you may have rights to access, correct, delete, restrict, object
          to processing, or receive a portable copy of personal information. You may also withdraw
          consent where processing relies on consent and complain to your local data-protection
          authority.
        </p>
        <p>
          Send requests to <a href="mailto:alim888aa88@gmail.com">alim888aa88@gmail.com</a>. We may need
          to verify your identity before completing a request. You may appeal a refused request by
          replying to our decision.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children and teenagers',
    content: (
      <p>
        AI Protégé is not available to children under 13. Users under the age of legal majority where
        they live must have permission from a parent or legal guardian. If you believe a child under 13
        has provided personal information, contact us so we can investigate and delete it as required.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Policy changes',
    content: (
      <p>
        We may update this policy as the service or law changes. We will post the new effective date and
        provide additional notice when required. Material changes will apply prospectively unless the
        law allows otherwise.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="LEGAL / PRIVACY"
      title="Privacy Policy"
      intro="What AI Protégé collects, why we need it, and the choices you have."
      updated={updated}
      sections={sections}
    />
  );
}
