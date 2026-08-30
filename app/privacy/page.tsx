import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
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
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">Privacy Policy</h1>
            <p className="text-muted-foreground mb-12">Last updated: August 2026</p>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">1. Introduction</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Welcome to Agora ("we," "our," or "us"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy governs the privacy policies and practices of our website and application, focusing on how we handle the data you provide to enable peer-to-peer knowledge exchange.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">2. Information We Collect</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We collect information that you voluntarily provide to us when you register on the platform. This includes:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground leading-relaxed space-y-2">
                <li><strong>Profile Information:</strong> Name, professional title, location, and a brief biography.</li>
                <li><strong>Skill Data:</strong> The specific skills you are looking to learn and the skills you are offering to teach.</li>
                <li><strong>Account Credentials:</strong> Email address and encrypted passwords.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We use the information we collect primarily to facilitate the core function of Agora: matching you with peers. Specifically, we use your data to:
              </p>
              <ul className="list-disc pl-6 mb-4 text-muted-foreground leading-relaxed space-y-2">
                <li>Power our matchmaking engine to find reciprocal skill swaps.</li>
                <li>Display your profile to other members in the directory (based on your visibility settings).</li>
                <li>Enable secure, isolated messaging between matched peers.</li>
                <li>Enforce our zero-spam policies and maintain a safe learning environment.</li>
              </ul>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">4. Secure Messaging and Inbox Isolation</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                Agora utilizes an isolated inbox system. Messages sent between users are guarded until connection requests are mutually accepted. We do not read the content of your direct messages unless they are flagged and reported by a user for violating our community guidelines (e.g., spam, harassment).
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">5. Data Sharing and Disclosure</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                We do not sell, trade, or rent your personal identification information to others. We share your profile information solely with other registered members of the platform to facilitate peer connections, as dictated by your privacy settings.
              </p>
            </section>

            <section className="mb-10">
              <h2 className="text-2xl font-bold mt-10 mb-4">6. Contact Us</h2>
              <p className="mb-4 text-muted-foreground leading-relaxed">
                If you have questions or comments about this Privacy Policy, please contact us at: <a href="mailto:privacy@agora.exchange" className="font-semibold text-primary hover:underline">privacy@agora.exchange</a>.
              </p>
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}
