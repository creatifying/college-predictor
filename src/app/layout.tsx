import type { Metadata } from "next";
import Link from "next/link";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "College Predictor - JoSAA & CSAB 2025 (IITs, NITs, IIITs, GFTIs)",
  description: "Predict your admission chances at IITs, NITs, IIITs, and GFTIs using official JoSAA & CSAB cutoffs, custom preference wishlists, and latest verified NIRF rankings and placement salary data.",
  keywords: "JoSAA, CSAB, college predictor, IIT, NIT, IIIT, GFTI, JEE, rank predictor, admission chances, NIRF rankings, placement package, median salary",
  authors: [{ name: "College Predictor Team" }],
  openGraph: {
    title: "College Predictor - JoSAA & CSAB 2025",
    description: "Analyze JoSAA & CSAB cutoffs, NIRF rankings, and placement statistics to find your best matching IIT, NIT, IIIT, or GFTI.",
    type: "website",
    locale: "en_US"
  },
  verification: {
    google: "R5PJn_182iIxsSeM_O-qIsleuMBcGwdXndYQygreSxI"
  }
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-primary/20 selection:text-primary">
        {/* Navbar */}
        <nav className="cp-navbar">
          <div className="cp-nav-container cp-container">
            <Link href="/" className="cp-logo" style={{ display: "flex", alignItems: "center", padding: 0 }}>
              <img src="/logo.png" alt="CollegePredictor Logo" style={{ height: "32px", width: "auto", objectFit: "contain" }} />
            </Link>
            <div className="cp-nav-links">
              <Link href="/josaa" className="cp-nav-link">
                JoSAA
              </Link>
              <Link href="/csab" className="cp-nav-link">
                CSAB
              </Link>
            </div>
          </div>
        </nav>

        {/* Main page wrapper offsets fixed navbar height */}
        <main className="cp-pt-navbar">
          {children}
        </main>

        {/* Footer with Links, Support Buttons & Disclaimer */}
        <footer className="cp-footer" style={{ padding: "40px 0", borderTop: "1px solid var(--color-border)", background: "var(--color-card-bg)", marginTop: "80px" }}>


          
          <div className="cp-container">
            <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
              {/* Top Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "20px" }}>
                {/* Brand */}
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <img src="/logo.png" alt="CollegePredictor Logo" style={{ height: "26px", width: "auto", objectFit: "contain", alignSelf: "flex-start" }} />
                  <div style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                    © 2025 CollegePredictor. All rights reserved.
                  </div>
                </div>

                {/* Links */}
                <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
                  <a href="https://josaa.nic.in" target="_blank" rel="noopener noreferrer" className="cp-footer-link">
                    JoSAA Official
                  </a>
                  <a href="https://csab.nic.in" target="_blank" rel="noopener noreferrer" className="cp-footer-link">
                    CSAB Official
                  </a>
                  <a href="https://github.com/creatifying" target="_blank" rel="noopener noreferrer" className="cp-footer-link" style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ verticalAlign: "middle" }}>
                      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                    </svg>
                    GitHub
                  </a>
                </div>

                {/* Support Badge */}
                <div>
                  <a
                    href="https://buymeacoffee.com/creatifying"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cp-bmc-btn"
                  >
                    <img
                      src="https://cdn.buymeacoffee.com/buttons/bmc-new-btn-logo.svg"
                      alt="Buy me a coffee"
                      style={{
                        height: "22px",
                        width: "22px",
                        marginRight: "6px",
                        verticalAlign: "middle"
                      }}
                    />
                    <span style={{ fontSize: "18px", fontFamily: "'Cookie', cursive", color: "#000000" }}>Buy me a coffee</span>
                  </a>
                </div>
              </div>

              {/* Bottom Row - Disclaimer */}
              <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "16px", fontSize: "0.725rem", color: "var(--color-muted-foreground)", lineHeight: "1.5" }}>
                <p style={{ margin: 0, maxWidth: "800px" }}>
                  <strong>Important Disclaimer:</strong> While every effort is made to maintain accurate data, there can be mistakes in the historical cutoffs or seat details. Candidates must always verify closing ranks, seat availability, and eligibility criteria directly with the official JoSAA (josaa.nic.in) or CSAB (csab.nic.in) websites before finalizing and locking choices. We are not responsible for any counseling decisions or allocation outcomes.
                </p>
              </div>
            </div>
          </div>
        </footer>

        <Script
          src="https://cdnjs.buymeacoffee.com/1.0.0/button.prod.min.js"
          data-name="bmc-button"
          data-slug="creatifying"
          data-color="#FFDD00"
          data-emoji=""
          data-font="Cookie"
          data-text="Buy me a coffee"
          data-outline-color="#000000"
          data-font-color="#000000"
          data-coffee-color="#ffffff"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
