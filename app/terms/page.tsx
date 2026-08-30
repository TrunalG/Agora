import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <main className="flex-1 py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          
          <Link 
            href="/" 
            className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground transition-colors mb-12"
          >
            <ArrowLeft className="mr-2 size-4" />
            Back to Home
          </Link>

          <article className="prose prose-sm sm:prose-base dark:prose-invert prose-headings:font-bold prose-headings:tracking-tight prose-a:text-primary max-w-none">
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Terms of Service</h1>
            <p className="text-muted-foreground mb-12">Last updated: August 2026</p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                By accessing or using the Agora platform ("the Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">2. Description of Service</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Agora is a peer-to-peer knowledge exchange platform designed to connect individuals for the purpose of reciprocal skill sharing. The platform provides tools to create a profile, list skills you wish to learn and teach, discover matching peers, and communicate securely.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">3. User Conduct and Zero-Spam Policy</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Agora is built on trust and mutual respect. We strictly enforce a zero-spam policy. By using the Platform, you agree not to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground leading-relaxed space-y-2">
                <li>Send unsolicited promotional messages, advertisements, or sales pitches.</li>
                <li>Harass, abuse, or harm other users.</li>
                <li>Use the platform for any financial transactions or paid services; Agora is strictly for reciprocal, non-monetary skill exchange.</li>
                <li>Create false identities or impersonate any person or entity.</li>
              </ul>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Violation of these rules will result in immediate account termination.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">4. Account Termination</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We reserve the right to terminate or suspend access to our Service immediately, without prior notice or liability, for any reason whatsoever, including, without limitation, if you breach the Terms of Service.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">5. Limitation of Liability</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Agora acts solely as a matching service for educational networking. We do not verify the credentials, expertise, or background of our users. We are not responsible for the accuracy of information provided by users, the quality of knowledge exchanged, or any interactions that occur as a result of using the platform. In no event shall Agora be liable for any indirect, incidental, special, consequential, or punitive damages.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">6. Changes to Terms</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes a material change will be determined at our sole discretion. We will provide notice of any significant changes.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">7. Contact Us</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you have any questions about these Terms, please contact us at: <a href="mailto:support@agora.exchange" className="font-semibold text-primary hover:underline">support@agora.exchange</a>.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
