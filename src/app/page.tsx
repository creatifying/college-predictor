"use client";

import { useState } from "react";
import Link from "next/link";

// Custom Accordion Item Component for FAQs
function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="cp-card cp-card-hover"
      style={{
        padding: "20px",
        marginBottom: "12px",
        cursor: "pointer",
        textAlign: "left",
        background: isOpen ? "rgba(26, 115, 232, 0.03)" : "var(--color-card-bg)",
        borderColor: isOpen ? "rgba(26, 115, 232, 0.25)" : "var(--color-border)",
        transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
      }}
      onClick={() => setIsOpen(!isOpen)}
    >
      <div className="cp-flex cp-items-center cp-justify-between" style={{ display: "flex", gap: "16px", userSelect: "none" }}>
        <h3 style={{ fontSize: "0.95rem", fontWeight: 700, margin: 0, color: isOpen ? "var(--color-primary)" : "var(--color-foreground)" }}>
          {question}
        </h3>
        <span style={{ fontSize: "1.25rem", fontWeight: 600, color: "var(--color-muted-foreground)", transform: isOpen ? "rotate(45deg)" : "none", transition: "transform 0.2s" }}>
          ＋
        </span>
      </div>
      <div
        style={{
          maxHeight: isOpen ? "500px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.3s ease-out, opacity 0.2s",
          opacity: isOpen ? 1 : 0,
          marginTop: isOpen ? "12px" : "0px"
        }}
      >
        <p style={{ fontSize: "0.875rem", lineHeight: "1.6", color: "var(--color-secondary-foreground)", margin: 0, fontWeight: 400 }}>
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function HomePage() {
  // Schema Markup for SEO
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": "https://jee.qzz.io/#website",
        "url": "https://jee.qzz.io",
        "name": "College Predictor",
        "description": "Analyze JoSAA & CSAB counseling data, NIRF rankings, and placement statistics to find your best matching IIT, NIT, IIIT, or GFTI.",
        "publisher": {
          "@type": "Organization",
          "name": "College Predictor Team"
        }
      },
      {
        "@type": "FAQPage",
        "@id": "https://jee.qzz.io/#faq",
        "mainEntity": [
          {
            "@type": "Question",
            "name": "How accurate are the admission predictions?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Predictions are highly accurate, modeled directly from official JoSAA/CSAB cutoff ranks from 2022 to 2025. It evaluates category cutoff bounds, home state quotas, and female-only seats across multiple counseling rounds to calculate precise admission probabilities."
            }
          },
          {
            "@type": "Question",
            "name": "What is the difference between JoSAA and CSAB counselors?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "JoSAA coordinates the primary rounds of counseling for IITs, NITs, IIITs, and GFTIs. CSAB handles special rounds conducted afterward to fill vacant seats left in NITs, IIITs, and GFTIs, often allowing students to secure admissions at slightly higher ranks."
            }
          },
          {
            "@type": "Question",
            "name": "Does the predictor support Category ranks?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "Yes, it supports all category seat allocations (General, OBC-NCL, SC, ST, EWS, and PwD) using category rankings for JoSAA rounds and CRL ranks for CSAB rounds, complying with official seat allocation parameters."
            }
          },
          {
            "@type": "Question",
            "name": "How does the custom preference list builder work?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "You can add any recommended program card to your Wishlist, type remarks/notes, and reorder choices numerically inside the list. Your preference wishlist can then be exported as a Choice Filling text file (.txt) or printed as a clean, high-fidelity PDF report."
            }
          },
          {
            "@type": "Question",
            "name": "Where do the NIRF and Placement salary stats come from?",
            "acceptedAnswer": {
              "@type": "Answer",
              "text": "We compile ranking timeline histories and placement records directly from official institutional NIRF reports and Career Development reports. Statistics cover B.Tech 4-Year and Dual Degree 5-Year programs, indicating student batch sizes, placement percentages, and median salary packages."
            }
          }
        ]
      }
    ]
  };

  return (
    <div className="cp-w-full relative overflow-hidden">
      {/* JSON-LD Schema Markup */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />

      {/* Decorative Orbs for Glassmorphism Background */}
      <div className="absolute inset-0 bg-grid bg-radial-glow pointer-events-none" />
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Hero Section */}
      <section className="relative cp-container cp-py-section">
        <div className="cp-text-center cp-animate-fade-in">
          {/* Top Badge */}
          <div className="cp-flex cp-items-center cp-justify-center cp-flex-wrap cp-gap-md cp-mb-lg" style={{ gap: "12px" }}>
            <div className="cp-badge-counter" style={{ margin: 0, background: "rgba(26, 115, 232, 0.06)", color: "var(--color-primary)", borderColor: "rgba(26, 115, 232, 0.15)", display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 12px" }}>
              <div className="cp-flex cp-items-center" style={{ color: "var(--color-primary)", gap: "2px", display: "flex" }}>
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="12" height="12" fill="currentColor" viewBox="0 0 24 24" style={{ display: "block" }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                ))}
              </div>
              <span style={{ fontWeight: 600, fontSize: "0.75rem", textTransform: "none", letterSpacing: "normal" }}>Loved by 10,000+ JEE Aspirants</span>
            </div>
          </div>

          <h1 className="cp-hero-title" style={{ color: "var(--color-foreground)", background: "none", WebkitTextFillColor: "initial", lineHeight: "1.15" }}>
            The <span style={{ color: "var(--color-primary)" }}>Perfect</span> College for Your <span style={{ color: "var(--color-primary)" }}>JEE</span> Rank
          </h1>

          <p className="cp-subtitle cp-mb-xl" style={{ maxWidth: "720px", margin: "0 auto 40px auto" }}>
            Predict your admission chances at <strong>IITs, NITs, IIITs, and GFTIs</strong> with detailed <strong>NIRF Ranking timelines</strong> and verified <strong>Placement Packages / Median Salaries</strong>. 100% Free tool with complete verified stats for all 128 institutes.
          </p>

          {/* Core Predictor CTAs */}
          <div className="cp-grid cp-grid-2" style={{ maxWidth: "840px", margin: "0 auto" }}>
            {/* JoSAA Card */}
            <Link href="/josaa" className="cp-card cp-card-hover cp-card-interactive cp-text-left" style={{ padding: "32px", display: "block" }}>
              <div className="cp-flex cp-items-center cp-gap-md cp-mb-sm">
                <div className="cp-logo-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                    <path d="M6 12v5c3 3 9 3 12 0v-5" />
                  </svg>
                </div>
                <div>
                  <h2 className="cp-card-title" style={{ fontSize: "1.15rem" }}>JoSAA Counseling</h2>
                  <p className="cp-label" style={{ margin: 0, fontSize: "0.6875rem" }}>IITs, NITs, IIITs & GFTIs</p>
                </div>
              </div>
              <p className="cp-label" style={{ textTransform: "none", fontWeight: "normal", margin: "12px 0 24px 0", fontSize: "0.875rem", lineHeight: "1.6" }}>
                Find matching programs and branches across all counseling cycles with Category Rank, Gender, and state quota optimizations.
              </p>
              <div className="cp-flex cp-items-center cp-gap-sm" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-primary)" }}>
                Start JoSAA Predictor
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>

            {/* CSAB Card */}
            <Link href="/csab" className="cp-card cp-card-hover cp-card-interactive cp-text-left" style={{ padding: "32px", display: "block" }}>
              <div className="cp-flex cp-items-center cp-gap-md cp-mb-sm">
                <div className="cp-logo-icon" style={{ color: "var(--color-accent)", background: "rgba(88, 86, 214, 0.06)", borderColor: "rgba(88, 86, 214, 0.15)" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                    <path d="M8 21h8" />
                    <path d="M12 17v4" />
                  </svg>
                </div>
                <div>
                  <h2 className="cp-card-title" style={{ fontSize: "1.15rem" }}>CSAB Special Rounds</h2>
                  <p className="cp-label" style={{ margin: 0, fontSize: "0.6875rem" }}>NITs, IIITs & GFTIs</p>
                </div>
              </div>
              <p className="cp-label" style={{ textTransform: "none", fontWeight: "normal", margin: "12px 0 24px 0", fontSize: "0.875rem", lineHeight: "1.6" }}>
                Access vacant seats analysis and cutoff trends in CSAB Special Rounds utilizing CRL ranks for all reservation categories.
              </p>
              <div className="cp-flex cp-items-center cp-gap-sm" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--color-accent)" }}>
                Start CSAB Predictor
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </Link>
          </div>

          {/* Council Badges */}
          <div className="cp-flex cp-items-center cp-justify-center cp-flex-col cp-gap-sm cp-mt-xl cp-animate-fade-in" style={{ animationDelay: "0.2s", gap: "10px", marginTop: "40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
            <span className="cp-label" style={{ fontSize: "0.7rem", letterSpacing: "0.08em", color: "var(--color-muted-foreground)", fontWeight: 700 }}>
              BASED ON OFFICIAL COUNSELING DATA
            </span>
            <div className="cp-flex cp-items-center cp-justify-center cp-gap-xl" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "24px" }}>
              <div className="cp-flex cp-items-center cp-gap-xs" style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--color-card-bg)", border: "1px solid var(--color-border)", padding: "6px 12px", borderRadius: "8px", boxShadow: "var(--box-shadow-sm)" }}>
                <img src="/logo-josaa.png" alt="JoSAA counseling official" style={{ height: "20px", width: "auto", objectFit: "contain" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e3a8a" }}>JoSAA</span>
              </div>
              <div className="cp-flex cp-items-center cp-gap-xs" style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--color-card-bg)", border: "1px solid var(--color-border)", padding: "6px 12px", borderRadius: "8px", boxShadow: "var(--box-shadow-sm)" }}>
                <img src="/logo-csab.png" alt="CSAB counseling official" style={{ height: "20px", width: "auto", objectFit: "contain" }} />
                <span style={{ fontSize: "0.8125rem", fontWeight: 700, color: "#1e3a8a" }}>CSAB</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 100% Placement Data Coverage Marketing Banner */}
      <section className="cp-container cp-mb-xl cp-animate-fade-in" style={{ animationDelay: "0.3s", marginBottom: "40px" }}>
        <div style={{
          background: "linear-gradient(135deg, rgba(26, 115, 232, 0.06) 0%, rgba(122, 79, 240, 0.06) 100%)",
          border: "1px solid rgba(26, 115, 232, 0.15)",
          borderRadius: "16px",
          padding: "24px 32px",
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 8px 32px rgba(26, 115, 232, 0.02)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
        }}>
          <div style={{ flex: "1 1 500px", textAlign: "left" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(52, 168, 83, 0.1)", color: "#137333", border: "1px solid rgba(52, 168, 83, 0.15)", borderRadius: "20px", padding: "4px 12px", fontSize: "0.75rem", fontWeight: 700, marginBottom: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
              100% Placement Verified
            </div>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px 0", color: "var(--color-foreground)" }}>
              Complete Placement Stats for All 128 Colleges
            </h3>
            <p style={{ fontSize: "0.875rem", color: "var(--color-secondary-foreground)", margin: 0, lineHeight: "1.6" }}>
              Every single IIT, NIT, IIIT, and GFTI in our database includes verified salary trends, student placement percentages, and graduation counts. Make informed decisions based on real career outcomes.
            </p>
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
            <div style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid var(--color-border)", padding: "12px 20px", borderRadius: "12px", textAlign: "center", minWidth: "125px" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 850, color: "var(--color-primary)" }}>100%</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", fontWeight: 700, marginTop: "2px" }}>Placement Stats</div>
            </div>
            <div style={{ background: "rgba(255, 255, 255, 0.8)", border: "1px solid var(--color-border)", padding: "12px 20px", borderRadius: "12px", textAlign: "center", minWidth: "125px" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 850, color: "var(--color-primary)" }}>2022-25</div>
              <div style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", fontWeight: 700, marginTop: "2px" }}>NIRF Submissions</div>
            </div>
          </div>
        </div>
      </section>


      {/* Premium Counseling Tools Section */}
      <section className="cp-py-section relative cp-container" style={{ borderTop: "1px solid var(--color-border)" }}>
        <h2 className="cp-section-title cp-text-center cp-mb-xl">Advanced Features for Smart Counseling</h2>
        <div className="cp-grid cp-grid-2" style={{ maxWidth: "960px", margin: "0 auto" }}>
          
          <div className="cp-card cp-card-hover cp-text-left" style={{ padding: "28px" }}>
            <div className="cp-flex cp-items-center cp-gap-md cp-mb-sm">
              <div className="cp-logo-icon" style={{ background: "rgba(52, 168, 83, 0.06)", color: "#137333", borderColor: "rgba(52, 168, 83, 0.15)" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <h3 className="cp-card-title" style={{ margin: 0, fontSize: "1rem" }}>Custom Preference Wishlists</h3>
            </div>
            <p className="cp-label" style={{ textTransform: "none", fontWeight: "normal", fontSize: "0.875rem", lineHeight: "1.5", margin: "8px 0 0 0" }}>
              Add recommended branches to your personal wishlist with a single click. Keep track of potential admissions and filter by institute types or state categories.
            </p>
          </div>

          <div className="cp-card cp-card-hover cp-text-left" style={{ padding: "28px" }}>
            <div className="cp-flex cp-items-center cp-gap-md cp-mb-sm">
              <div className="cp-logo-icon" style={{ background: "rgba(249, 171, 0, 0.06)", color: "#b06000", borderColor: "rgba(249, 171, 0, 0.15)" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="cp-card-title" style={{ margin: 0, fontSize: "1rem" }}>Interactive Remarks & Notes</h3>
            </div>
            <p className="cp-label" style={{ textTransform: "none", fontWeight: "normal", fontSize: "0.875rem", lineHeight: "1.5", margin: "8px 0 0 0" }}>
              Annotate wishlisted choices with custom remarks (e.g., &quot;High fees&quot;, &quot;Excellent campus&quot;). Notes are saved locally and included in your export downloads.
            </p>
          </div>

          <div className="cp-card cp-card-hover cp-text-left" style={{ padding: "28px" }}>
            <div className="cp-flex cp-items-center cp-gap-md cp-mb-sm">
              <div className="cp-logo-icon" style={{ background: "rgba(66, 133, 244, 0.06)", color: "#1a73e8", borderColor: "rgba(66, 133, 244, 0.15)" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="cp-card-title" style={{ margin: 0, fontSize: "1rem" }}>Direct Numeric Reordering</h3>
            </div>
            <p className="cp-label" style={{ textTransform: "none", fontWeight: "normal", fontSize: "0.875rem", lineHeight: "1.5", margin: "8px 0 0 0" }}>
              Quickly rearrange choices by typing your preferred position number inside the wishlist. The builder handles index shifting dynamically to compile a perfect filling list.
            </p>
          </div>

          <div className="cp-card cp-card-hover cp-text-left" style={{ padding: "28px" }}>
            <div className="cp-flex cp-items-center cp-gap-md cp-mb-sm">
              <div className="cp-logo-icon" style={{ background: "rgba(217, 48, 37, 0.06)", color: "#d93025", borderColor: "rgba(217, 48, 37, 0.15)" }}>
                <svg width="22" height="22" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="cp-card-title" style={{ margin: 0, fontSize: "1rem" }}>PDF & Text Exporters</h3>
            </div>
            <p className="cp-label" style={{ textTransform: "none", fontWeight: "normal", fontSize: "0.875rem", lineHeight: "1.5", margin: "8px 0 0 0" }}>
              Download choice filling sheets in `.txt` format matching JoSAA console layout, or save polished PDF reports detailing predicted outcomes.
            </p>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="cp-py-section relative cp-container" style={{ borderTop: "1px solid var(--color-border)" }}>
        <h2 className="cp-section-title cp-text-center cp-mb-xl">Frequently Asked Questions</h2>
        <div style={{ maxWidth: "780px", margin: "0 auto" }}>
          <FaqItem
            question="How accurate are the admission predictions?"
            answer="All calculations are based strictly on official cutoff ranks released by JoSAA and CSAB from 2022 to 2025. By analyzing home state quotas, gender seats (neutral vs. female-only), and categories, the engine calculates a precise probability level (High, Medium, Low) for matching your JEE rank."
          />
          <FaqItem
            question="What is the difference between JoSAA and CSAB counseling?"
            answer="JoSAA (Joint Seat Allocation Authority) conducts the primary 5 or 6 rounds of seat allocation for all IITs, NITs, IIITs, and GFTIs. CSAB (Central Seat Allocation Board) conducts subsequent Special Rounds to allocate leftover vacant seats in NITs, IIITs, and GFTIs (excluding IITs). Cutoffs in CSAB rounds are often significantly relaxed."
          />
          <FaqItem
            question="Does the predictor support Category ranks?"
            answer="Yes. The JoSAA predictor accepts category ranks (General, OBC-NCL, SC, ST, EWS) because JoSAA allocates seats based on your specific category rank. The CSAB predictor uses CRL (Common Rank List) rank, as CSAB rounds evaluate candidates using CRL ranks while applying category allocations."
          />
          <FaqItem
            question="How does the custom preference list builder work?"
            answer="As you evaluate options, click 'View NIRF & Placements' or check the closing rank cutoff charts. Bookmark preferred branches to add them to your Wishlist. In the Wishlist panel, you can type notes and directly enter list numbers to reorder branches, compiling a verified reference list for final choice entry."
          />
          <FaqItem
            question="Where do the NIRF and Placement salary stats come from?"
            answer="The data is compiled directly from institutional NIRF submissions and official placement brochures. We focus on B.Tech 4-Year and Integrated Dual Degree 5-Year placements to supply metrics like total eligible students, placed counts, placement rates, and median package salaries."
          />
        </div>
      </section>
    </div>
  );
}
