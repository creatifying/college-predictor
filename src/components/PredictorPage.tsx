"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { INDIAN_STATES, CATEGORIES, GENDERS, COLLEGE_TYPE_FILTERS, COURSE_DURATIONS, DEGREE_FILTERS, BRANCH_CATEGORIES, PROBABILITY_LEVELS, JOSAA_QUOTAS } from "@/lib/constants";
import { classifyBranch } from "@/lib/branch-mapper";
import { getInstituteState, NEARBY_STATES } from "@/lib/institute-state";
import { getInstituteSubtype } from "@/lib/institute-subtype";
import { generateAuthToken, getAESKey, decryptData } from "@/lib/auth";
import type { ProbabilityLevel } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import nirfDataRaw from "@/data/nirf_data.json";


// SVG Icons for modern visual style (replacing emojis)
const StarIcon = ({ active, style, className }: { active: boolean; style?: React.CSSProperties; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill={active ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "14px", height: "14px", ...style }}
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

const MapPinIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "13px", height: "13px", ...style }}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const ChartBarIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "14px", height: "14px", ...style }}
  >
    <line x1="18" y1="20" x2="18" y2="10" />
    <line x1="12" y1="20" x2="12" y2="4" />
    <line x1="6" y1="20" x2="6" y2="14" />
  </svg>
);

const TrashIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "14px", height: "14px", ...style }}
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const SearchIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "20px", height: "20px", ...style }}
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const DownloadIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "14px", height: "14px", ...style }}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ChevronUpIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "12px", height: "12px", ...style }}
  >
    <polyline points="18 15 12 9 6 15" />
  </svg>
);

const ChevronDownIcon = ({ style }: { style?: React.CSSProperties }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ width: "12px", height: "12px", ...style }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const StatusDot = ({ type }: { type: "high" | "medium" | "low" }) => {
  const colors = {
    high: "var(--color-high)",
    medium: "var(--color-medium)",
    low: "var(--color-low)",
  };
  return (
    <span style={{
      display: "inline-block",
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      backgroundColor: colors[type],
      marginRight: "8px",
      verticalAlign: "middle"
    }} />
  );
};

interface PredictionResult {
  instituteName: string;
  instituteCode: number;
  instituteType: string;
  programName: string;
  programType: string;
  programDuration: number;
  openingRank: number;
  closingRank: number;
  probability: ProbabilityLevel;
  quota: string;
  seatType: string;
  round: number;
}

interface NirfRanking {
  year: number;
  rank: number | string;
  score: number | null;
  pdf_url: string;
}

interface NirfPlacement {
  program_duration: number;
  ranking_year: number;
  placement_year: string;
  total_graduated: number;
  placed_students: number;
  median_salary_num: number;
  median_salary: string;
}

interface NirfInstituteData {
  institute_code: number;
  predictor_name: string;
  nirf_name: string;
  city: string;
  state: string;
  rankings: NirfRanking[];
  placements: NirfPlacement[];
}

const NIRF_DATA = nirfDataRaw as Record<string, NirfInstituteData>;

const getLatestNirfRank = (instituteCode: number): number => {
  const info = NIRF_DATA[instituteCode];
  if (info && info.rankings && info.rankings.length > 0) {
    return Number(info.rankings[info.rankings.length - 1].rank);
  }
  return 999999;
};

const getLatestMedianSalary = (instituteCode: number): number => {
  const info = NIRF_DATA[instituteCode];
  if (info && info.placements && info.placements.length > 0) {
    return info.placements[info.placements.length - 1].median_salary_num;
  }
  return 0;
};

const getLatestPlacementPercentage = (instituteCode: number): number => {
  const info = NIRF_DATA[instituteCode];
  if (info && info.placements && info.placements.length > 0) {
    const latest = info.placements[info.placements.length - 1];
    if (latest.total_graduated > 0) {
      return (latest.placed_students / latest.total_graduated) * 100;
    }
  }
  return 0;
};

const NirfDetails = ({ instituteCode, isMobile }: { instituteCode: number; isMobile?: boolean }) => {
  const info = NIRF_DATA[instituteCode];
  
  // Filter placements for B.Tech (4 years) and Integrated Dual (5 years)
  const relevantPlacements = info?.placements ? info.placements.filter(p => p.program_duration === 4 || p.program_duration === 5) : [];
  const displayPlacements = relevantPlacements.length > 0 ? relevantPlacements : (info?.placements || []);
  const hasPlacements = displayPlacements.length > 0;

  const [activeTab, setActiveTab] = useState<"rankings" | "placements">(
    hasPlacements ? "placements" : "rankings"
  );

  useEffect(() => {
    if (info) {
      const hasPlac = (info.placements || []).some(p => p.program_duration === 4 || p.program_duration === 5) || (info.placements || []).length > 0;
      setActiveTab(hasPlac ? "placements" : "rankings");
    }
  }, [instituteCode, info]);

  if (!info) return null;

  // Group placements by duration so we can show tabs or grouped cards
  const placementsByDuration = displayPlacements.reduce((acc, curr) => {
    const durKey = curr.program_duration === 4 ? "UG 4-Year (B.Tech)" : curr.program_duration === 5 ? "UG 5-Year (Integrated/Dual)" : `UG ${curr.program_duration}-Year`;
    if (!acc[durKey]) acc[durKey] = [];
    acc[durKey].push(curr);
    return acc;
  }, {} as Record<string, typeof displayPlacements>);

  const chartData = displayPlacements.reduce((acc, curr) => {
    const existing = acc.find(item => item.year === curr.placement_year);
    const salaryLPA = curr.median_salary_num / 100000;
    if (existing) {
      if (salaryLPA > existing.salary) {
        existing.salary = salaryLPA;
        existing.display = curr.median_salary;
      }
    } else {
      acc.push({
        year: curr.placement_year,
        salary: salaryLPA,
        display: curr.median_salary,
        label: `${curr.placement_year}`
      });
    }
    return acc;
  }, [] as Array<{ year: string; salary: number; display: string; label: string }>).sort((a, b) => a.year.localeCompare(b.year));

  // Calculate salary growth if we have at least 2 data points
  const latestSalary = chartData[chartData.length - 1];
  const oldestSalary = chartData[0];
  const showGrowth = chartData.length >= 2 && latestSalary && oldestSalary && oldestSalary.salary > 0;
  const growthPercent = showGrowth ? (((latestSalary.salary - oldestSalary.salary) / oldestSalary.salary) * 100).toFixed(0) : "0";

  return (
    <div style={{
      marginTop: "16px",
      marginBottom: "20px",
      padding: isMobile ? "12px" : "20px",
      background: "#ffffff",
      border: "1px solid var(--color-border)",
      borderRadius: "12px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)"
    }} className="animate-fade-in">
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--color-border)", paddingBottom: "12px", marginBottom: "16px", gap: "10px" }}>
        <h4 style={{ fontSize: isMobile ? "0.875rem" : "1rem", fontWeight: 800, color: "var(--color-primary)", margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
          NIRF Verified Rankings & Placements
        </h4>
        <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)", fontWeight: 500 }}>
          {info.city}, {info.state}
        </span>
      </div>

      {/* Tabs Selector */}
      <div style={{ display: "flex", borderBottom: "1px solid #e2e8f0", marginBottom: "16px" }}>
        <button
          onClick={() => setActiveTab("rankings")}
          style={{
            padding: "8px 16px",
            background: "none",
            border: "none",
            borderBottom: activeTab === "rankings" ? "2px solid var(--color-primary)" : "none",
            color: activeTab === "rankings" ? "var(--color-primary)" : "var(--color-muted-foreground)",
            fontWeight: 700,
            fontSize: "0.8125rem",
            cursor: "pointer",
            transition: "all 0.2s ease"
          }}
        >
          Rankings History
        </button>
        {hasPlacements && (
          <button
            onClick={() => setActiveTab("placements")}
            style={{
              padding: "8px 16px",
              background: "none",
              border: "none",
              borderBottom: activeTab === "placements" ? "2px solid var(--color-primary)" : "none",
              color: activeTab === "placements" ? "var(--color-primary)" : "var(--color-muted-foreground)",
              fontWeight: 700,
              fontSize: "0.8125rem",
              cursor: "pointer",
              transition: "all 0.2s ease"
            }}
          >
            Placements & Salaries
          </button>
        )}
      </div>

      {activeTab === "rankings" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }} className="animate-fade-in">
          <div style={{ fontSize: "0.8125rem", color: "var(--color-muted-foreground)", fontWeight: 500 }}>
            Historical overall NIRF rankings of the college. Click any card to inspect the official submitted PDF reports.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: "12px" }}>
            {info.rankings.map((r) => (
              <a
                key={r.year}
                href={r.pdf_url}
                target="_blank"
                rel="noopener noreferrer"
                title="View Official NIRF Submission PDF"
                style={{
                  padding: "16px 12px",
                  background: "#f8f9fa",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
                className="cp-card-hover"
              >
                <span style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)", fontWeight: 600 }}>{r.year} Report</span>
                <span style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--color-foreground)", marginTop: "6px" }}>Rank #{r.rank}</span>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-primary)", marginTop: "8px", display: "flex", alignItems: "center", gap: "4px" }}>
                  Verify PDF ↗
                </span>
              </a>
            ))}
          </div>
        </div>
      )}

      {activeTab === "placements" && hasPlacements && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }} className="animate-fade-in">
          {/* Chart & Highlights */}
          <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", gap: "20px", alignItems: "stretch" }}>
            {/* Highlights cards */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ padding: "14px", background: "rgba(26, 115, 232, 0.03)", border: "1px solid rgba(26, 115, 232, 0.08)", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase" }}>Latest Median Salary</span>
                <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-foreground)", marginTop: "4px" }}>
                  ₹{latestSalary?.display.replace("Lakhs", "LPA")}
                </div>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", display: "block", marginTop: "2px" }}>
                  Batch: {latestSalary?.year}
                </span>
              </div>
              <div style={{ padding: "14px", background: "rgba(16, 185, 129, 0.03)", border: "1px solid rgba(16, 185, 129, 0.08)", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", fontWeight: 600, textTransform: "uppercase" }}>Salary Growth</span>
                <div style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--color-foreground)", marginTop: "4px" }}>
                  ₹{oldestSalary?.display.replace("Lakhs", "LPA")} → ₹{latestSalary?.display.replace("Lakhs", "LPA")}
                </div>
                {showGrowth && (
                  <span style={{ fontSize: "0.6875rem", color: "var(--color-high)", display: "block", marginTop: "2px", fontWeight: 600 }}>
                    ({growthPercent}% growth over {chartData.length - 1} years)
                  </span>
                )}
              </div>
            </div>

            {/* Chart */}
            {chartData.length > 0 && (
              <div style={{ flex: 1.8, minWidth: 0, padding: "16px", border: "1px solid var(--color-border)", borderRadius: "8px", background: "#f8f9fa" }}>
                <h5 style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-secondary-foreground)", marginBottom: "8px", textAlign: "center" }}>
                  Median Salary Trend (LPA)
                </h5>
                <div style={{ width: "100%", height: "140px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="year" style={{ fontSize: "0.6875rem", fontWeight: 600 }} />
                      <YAxis type="number" style={{ fontSize: "0.6875rem" }} unit="L" />
                      <Tooltip formatter={(value) => [`₹${Number(value).toFixed(1)} Lakhs`, "Median Salary"]} labelStyle={{ fontSize: "0.75rem", fontWeight: 700 }} contentStyle={{ fontSize: "0.75rem", borderRadius: "6px" }} />
                      <Bar dataKey="salary" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={28} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div>
            <h5 style={{ fontSize: "0.75rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--color-muted-foreground)", marginBottom: "8px" }}>
              Cohort Placement History
            </h5>
            <div style={{ overflowX: "auto", border: "1px solid var(--color-border)", borderRadius: "8px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.75rem", minWidth: "500px" }}>
                <thead>
                  <tr style={{ background: "rgba(26, 115, 232, 0.03)", borderBottom: "1px solid var(--color-border)", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Program</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700 }}>Batch</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "center" }}>Graduated</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "center" }}>Placed</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "center" }}>Placement Rate</th>
                    <th style={{ padding: "10px 12px", fontWeight: 700, textAlign: "right" }}>Median Package</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(placementsByDuration).map(([durationLabel, records]) => (
                    records.map((r, rIdx) => {
                      const rate = r.total_graduated > 0 ? (r.placed_students / r.total_graduated * 100).toFixed(1) : "0.0";
                      return (
                        <tr key={`${durationLabel}-${rIdx}`} style={{ borderBottom: "1px solid #f1f3f4", transition: "background 0.2s" }} className="cp-table-row">
                          <td style={{ padding: "10px 12px", fontWeight: rIdx === 0 ? 600 : 400 }}>
                            {rIdx === 0 ? durationLabel : ""}
                          </td>
                          <td style={{ padding: "10px 12px", color: "var(--color-foreground)" }}>{r.placement_year}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--color-secondary-foreground)" }}>{r.total_graduated}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center", color: "var(--color-secondary-foreground)" }}>{r.placed_students}</td>
                          <td style={{ padding: "10px 12px", textAlign: "center" }}>
                            <span style={{
                              padding: "2px 6px",
                              borderRadius: "4px",
                              backgroundColor: Number(rate) >= 80 ? "rgba(19, 115, 51, 0.08)" : Number(rate) >= 60 ? "rgba(176, 96, 0, 0.08)" : "rgba(197, 34, 31, 0.08)",
                              color: Number(rate) >= 80 ? "var(--color-high)" : Number(rate) >= 60 ? "var(--color-medium)" : "var(--color-low)",
                              fontWeight: 700
                            }}>
                              {rate}%
                            </span>
                          </td>
                          <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 700, color: "var(--color-foreground)" }}>
                            ₹{r.median_salary.replace("Lakhs", "LPA").trim()}
                          </td>
                        </tr>
                      );
                    })
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




interface Filters {
  probability: ProbabilityLevel[];
  collegeTypes: string[];
  courseDurations: number[];
  degrees: string[];
  branches: string[];
  states: string[];
  nearDomicile: boolean;
  minNirfRank: string;
  minMedianSalary: string;
  sortBy: string;
}



interface PredictorPageProps {
  type: "josaa" | "csab";
  title: string;
  subtitle: string;
}

export default function PredictorPage({ type, title, subtitle }: PredictorPageProps) {
  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [homeState, setHomeState] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [crlRank, setCrlRank] = useState("");
  const [categoryRank, setCategoryRank] = useState("");

  // Custom states for notes and printing options
  const [favoritesNotes, setFavoritesNotes] = useState<Record<string, string>>({});
  const [printType, setPrintType] = useState<"branches" | "colleges">("branches");

  // UI state
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Favorites/Choice List state
  const [favorites, setFavorites] = useState<PredictionResult[]>([]);
  const [showFavoritesDrawer, setShowFavoritesDrawer] = useState(false);
  const [drawerViewMode, setDrawerViewMode] = useState<"priority" | "grouped">("priority");

  // Load favorites and remarks from localStorage on mount
  useEffect(() => {
    try {
      const storedFavs = localStorage.getItem(`cp_favs_${type}`);
      if (storedFavs) {
        setFavorites(JSON.parse(storedFavs));
      }
      const storedNotes = localStorage.getItem(`cp_favs_notes_${type}`);
      if (storedNotes) {
        setFavoritesNotes(JSON.parse(storedNotes));
      }
    } catch (err) {
      // localStorage unavailable or corrupted - use defaults
    }
  }, [type]);

  // Persist favorites to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`cp_favs_${type}`, JSON.stringify(favorites));
    } catch (err) {
      // localStorage write failed - preferences will not persist
    }
  }, [favorites, type]);

  // Persist remarks to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(`cp_favs_notes_${type}`, JSON.stringify(favoritesNotes));
    } catch (err) {
      // localStorage write failed - remarks will not persist
    }
  }, [favoritesNotes, type]);

  // Group favorites by college for Grouped by College view mode
  const groupedFavorites = useMemo(() => {
    const groups: Record<number, {
      instituteName: string;
      instituteCode: number;
      instituteType: string;
      state: string;
      programs: { fav: PredictionResult; originalIndex: number }[];
    }> = {};

    favorites.forEach((fav, index) => {
      if (!groups[fav.instituteCode]) {
        groups[fav.instituteCode] = {
          instituteName: fav.instituteName,
          instituteCode: fav.instituteCode,
          instituteType: fav.instituteType,
          state: getInstituteState(fav.instituteCode) || "Unknown State",
          programs: [],
        };
      }
      groups[fav.instituteCode].programs.push({ fav, originalIndex: index });
    });

    return Object.values(groups);
  }, [favorites]);

  // Accordion and Chart states
  const [expandedColleges, setExpandedColleges] = useState<number[]>([]);
  const [expandedCharts, setExpandedCharts] = useState<number[]>([]);
  const [expandedNirf, setExpandedNirf] = useState<number[]>([]);

  // Toggle college expanded state
  const toggleCollegeExpanded = (code: number) => {
    setExpandedColleges((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Toggle college chart expanded state
  const toggleChartExpanded = (code: number) => {
    setExpandedCharts((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  };

  // Toggle college NIRF expanded state
  const toggleNirfExpanded = (instCode: number) => {
    setExpandedNirf((prev) => {
      const isCurrentlyExpanded = prev.includes(instCode);
      if (!isCurrentlyExpanded) {
        // Auto-expand the main college card if it is not expanded
        setExpandedColleges((mainPrev) =>
          mainPrev.includes(instCode) ? mainPrev : [...mainPrev, instCode]
        );
      }
      return isCurrentlyExpanded ? prev.filter((c) => c !== instCode) : [...prev, instCode];
    });
  };


  // Add/remove favorite
  const toggleFavorite = (r: PredictionResult) => {
    setFavorites((prev) => {
      const exists = prev.some(
        (f) =>
          f.instituteCode === r.instituteCode &&
          f.programName === r.programName &&
          f.quota === r.quota &&
          f.seatType === r.seatType
      );
      if (exists) {
        return prev.filter(
          (f) =>
            !(
              f.instituteCode === r.instituteCode &&
              f.programName === r.programName &&
              f.quota === r.quota &&
              f.seatType === r.seatType
            )
        );
      } else {
        return [...prev, r];
      }
    });
  };

  // Add/remove all eligible branches of a college from favorites
  const toggleCollegeFavorite = (collegePrograms: PredictionResult[]) => {
    setFavorites((prev) => {
      const allInFavs = collegePrograms.every(p =>
        prev.some(f =>
          f.instituteCode === p.instituteCode &&
          f.programName === p.programName &&
          f.quota === p.quota &&
          f.seatType === p.seatType
        )
      );

      if (allInFavs) {
        return prev.filter(f =>
          !collegePrograms.some(p =>
            f.instituteCode === p.instituteCode &&
            f.programName === p.programName &&
            f.quota === p.quota &&
            f.seatType === p.seatType
          )
        );
      } else {
        const toAdd = collegePrograms.filter(p =>
          !prev.some(f =>
            f.instituteCode === p.instituteCode &&
            f.programName === p.programName &&
            f.quota === p.quota &&
            f.seatType === p.seatType
          )
        );
        return [...prev, ...toAdd];
      }
    });
  };

  // Helper to generate unique key for a preference
  const getFavKey = useCallback((f: PredictionResult) => {
    return `${f.instituteCode}-${f.programName}-${f.quota}-${f.seatType}`;
  }, []);

  // Move favorite item up/down
  const moveFavorite = (index: number, direction: "up" | "down") => {
    setFavorites((prev) => {
      const nextList = [...prev];
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= nextList.length) return prev;
      const temp = nextList[index];
      nextList[index] = nextList[targetIndex];
      nextList[targetIndex] = temp;
      return nextList;
    });
  };

  // Move favorite item to specific position (direct numeric entry)
  const moveFavoriteToPosition = (fromIndex: number, toPosition: number) => {
    setFavorites((prev) => {
      const nextList = [...prev];
      const toIndex = Math.max(0, Math.min(toPosition - 1, nextList.length - 1));
      if (fromIndex === toIndex) return prev;
      
      const [removed] = nextList.splice(fromIndex, 1);
      nextList.splice(toIndex, 0, removed);
      return nextList;
    });
  };

  // Clear all favorites/choices with confirmation
  const clearAllFavorites = () => {
    if (window.confirm("Are you sure you want to clear all choices in your preference wishlist? This cannot be undone.")) {
      setFavorites([]);
    }
  };

  // Export choice list to file
  const exportChoiceList = () => {
    if (favorites.length === 0) return;
    const header = `==================================================\n   MY ${type.toUpperCase()} PREFERENCE CHOICE FILLING ORDER\n==================================================\n   Generated by JEE College Predictor (jee.qzz.io)\n   Generated on: ${new Date().toLocaleDateString()}\n   Total Choices Selected: ${favorites.length}\n==================================================\n\n`;
    const content = favorites
      .map((f, i) => {
        const noteKey = getFavKey(f);
        const remark = favoritesNotes[noteKey];
        return `${String(i + 1).padStart(3, "0")}. [${f.instituteType}] ${f.instituteName}\n     Branch: ${f.programName}\n     Quota: ${f.quota} | Seat Type: ${f.seatType} | Duration: ${f.programDuration} Years\n     Chance: ${f.probability.toUpperCase()} (Closing Cutoff: ${f.closingRank.toLocaleString()})\n${remark ? `     Remark: ${remark}\n` : ""}     ----------------------------------------------`;
      })
      .join("\n");
    const footer = `\n\n==================================================\n   Generated by JEE College Predictor\n   https://jee.qzz.io\n\n   Found this helpful? Support the project:\n   https://buymeacoffee.com/creatifying\n==================================================\n`;
    
    const blob = new Blob([header + content + footer], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `my-${type}-choice-filling-order.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filter state
  const [filters, setFilters] = useState<Filters>({
    probability: [],
    collegeTypes: [],
    courseDurations: [],
    degrees: [],
    branches: [],
    states: [],
    nearDomicile: false,
    minNirfRank: "any",
    minMedianSalary: "any",
    sortBy: "probability",
  });


  // Search states for filters
  const [branchSearch, setBranchSearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");

  const canProceedStep1 = name && email && homeState && category && gender;
  const canProceedStep2 = crlRank && Number(crlRank) > 0;

  const handleSubmit = useCallback(async () => {
    if (!canProceedStep2) return;
    setLoading(true);
    setShowResults(false);

    try {
      const payload: Record<string, unknown> = {
        crlRank: Number(crlRank),
        category,
        gender,
        homeState,
        name,
        email,
      };
      if (type === "josaa" && categoryRank && category !== "OPEN") {
        payload.categoryRank = Number(categoryRank);
      }

      let token = "";
      try {
        token = await generateAuthToken();
      } catch (tokenErr) {
        // Token generation failed - request will proceed unauthenticated
      }

      const apiBase = process.env.NEXT_PUBLIC_API_URL || "https://college-predictor-api.workers.dev";
      const res = await fetch(`${apiBase}/api/predict/${type}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : ""
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as {
        encrypted?: string;
        iv?: string;
        window?: string;
        results?: PredictionResult[];
      };

      let finalResults: PredictionResult[] = [];
      if (data.encrypted && data.iv && data.window) {
        try {
          const aesKey = await getAESKey(data.window);
          const decryptedJson = await decryptData(data.encrypted, data.iv, aesKey);
          const parsed = JSON.parse(decryptedJson);
          if (parsed.results) {
            finalResults = parsed.results;
          }
        } catch (decryptErr) {
          // Decryption failed - response may have expired or been tampered with
        }
      } else if (data.results) {
        // Fallback for plain response (backward compatibility / local dev)
        finalResults = data.results;
      }

      if (finalResults && finalResults.length > 0) {
        setResults(finalResults);
        // Expand all colleges by default
        const uniqueCodes = Array.from(new Set(finalResults.map((r) => r.instituteCode)));
        setExpandedColleges(uniqueCodes);
        setShowResults(true);
      }
    } catch (err) {
      // Network or parsing error - no results will be shown
    } finally {
      setLoading(false);
    }
  }, [crlRank, categoryRank, category, gender, homeState, type, canProceedStep2, name, email]);

  // Apply filters to results
  const filteredResults = useMemo(() => {
    let filtered = [...results];

    if (filters.probability.length > 0) {
      filtered = filtered.filter((r) => filters.probability.includes(r.probability));
    }

    if (filters.collegeTypes.length > 0) {
      filtered = filtered.filter((r) => {
        return filters.collegeTypes.some((ft) => {
          const subtype = getInstituteSubtype(r.instituteCode, r.instituteType);
          if (ft === "GFTI") return r.instituteType === "GFTI";
          return subtype === ft;
        });
      });
    }

    if (filters.courseDurations.length > 0) {
      filtered = filtered.filter((r) => filters.courseDurations.includes(r.programDuration));
    }

    if (filters.degrees.length > 0) {
      filtered = filtered.filter((r) => {
        return filters.degrees.some((d) => {
          const degreeInfo = DEGREE_FILTERS.find((df) => df.value === d);
          if (!degreeInfo) return false;
          return degreeInfo.matchPatterns.some((p) => r.programType.includes(p));
        });
      });
    }

    if (filters.branches.length > 0) {
      filtered = filtered.filter((r) => {
        const branchCat = classifyBranch(r.programName);
        return filters.branches.includes(branchCat);
      });
    }

    if (filters.nearDomicile && homeState) {
      const nearbyStates = NEARBY_STATES[homeState] || [];
      const allowedStates = [homeState, ...nearbyStates];
      filtered = filtered.filter((r) => {
        const instState = getInstituteState(r.instituteCode);
        return allowedStates.includes(instState);
      });
    }

    if (filters.states.length > 0) {
      filtered = filtered.filter((r) => {
        const instState = getInstituteState(r.instituteCode);
        return filters.states.includes(instState);
      });
    }

    // Filter by NIRF Rank Category
    if (filters.minNirfRank && filters.minNirfRank !== "any") {
      const maxRank = filters.minNirfRank === "top50" ? 50 :
                      filters.minNirfRank === "top100" ? 100 :
                      filters.minNirfRank === "top150" ? 150 : 200;
      filtered = filtered.filter((r) => {
        const info = NIRF_DATA[r.instituteCode];
        if (!info || !info.rankings || info.rankings.length === 0) return false;
        const latestRank = info.rankings[info.rankings.length - 1].rank;
        return Number(latestRank) <= maxRank;
      });

    }

    // Filter by Minimum Median Salary
    if (filters.minMedianSalary && filters.minMedianSalary !== "any") {
      const minSalaryLakhs = parseFloat(filters.minMedianSalary);
      const minSalaryNum = minSalaryLakhs * 100000;
      filtered = filtered.filter((r) => {
        const info = NIRF_DATA[r.instituteCode];
        if (!info || !info.placements || info.placements.length === 0) return false;
        const relevantPlacements = info.placements.filter(p => p.program_duration === 4 || p.program_duration === 5);
        const displayPlacements = relevantPlacements.length > 0 ? relevantPlacements : info.placements;
        const latestPlacement = displayPlacements[displayPlacements.length - 1];
        return latestPlacement.median_salary_num >= minSalaryNum;
      });
    }

    return filtered;
  }, [results, filters, homeState]);

  // Group filtered results by college
  const groupedResults = useMemo(() => {
    const groups: Record<number, {
      instituteName: string;
      instituteCode: number;
      instituteType: string;
      state: string;
      programs: typeof filteredResults;
      maxProbability: ProbabilityLevel;
      minClosingRank: number;
      counts: {
        high: number;
        medium: number;
        low: number;
      };
    }> = {};

    for (const r of filteredResults) {
      if (!groups[r.instituteCode]) {
        groups[r.instituteCode] = {
          instituteName: r.instituteName,
          instituteCode: r.instituteCode,
          instituteType: r.instituteType,
          state: getInstituteState(r.instituteCode) || "Unknown State",
          programs: [],
          maxProbability: "low",
          minClosingRank: Infinity,
          counts: { high: 0, medium: 0, low: 0 },
        };
      }

      groups[r.instituteCode].programs.push(r);
      groups[r.instituteCode].counts[r.probability]++;

      // Update max probability (high > medium > low)
      const probOrder = { high: 0, medium: 1, low: 2 };
      if (probOrder[r.probability] < probOrder[groups[r.instituteCode].maxProbability]) {
        groups[r.instituteCode].maxProbability = r.probability;
      }

      // Update min closing rank
      if (r.closingRank < groups[r.instituteCode].minClosingRank) {
        groups[r.instituteCode].minClosingRank = r.closingRank;
      }
    }

    // Sort programs inside each college group
    const probOrder = { high: 0, medium: 1, low: 2 };
    for (const code in groups) {
      groups[code].programs.sort((a, b) => {
        const pDiff = probOrder[a.probability] - probOrder[b.probability];
        if (pDiff !== 0) return pDiff;
        return a.closingRank - b.closingRank;
      });
    }

    // Convert to array and sort colleges
    return Object.values(groups).sort((a, b) => {
      if (filters.sortBy === "nirf-asc") {
        const rankA = getLatestNirfRank(a.instituteCode);
        const rankB = getLatestNirfRank(b.instituteCode);
        if (rankA !== rankB) return rankA - rankB;
      } else if (filters.sortBy === "nirf-desc") {
        const rankA = getLatestNirfRank(a.instituteCode);
        const rankB = getLatestNirfRank(b.instituteCode);
        if (rankA !== rankB) {
          if (rankA === 999999) return 1;
          if (rankB === 999999) return -1;
          return rankB - rankA;
        }
      } else if (filters.sortBy === "salary-desc") {
        const salA = getLatestMedianSalary(a.instituteCode);
        const salB = getLatestMedianSalary(b.instituteCode);
        if (salA !== salB) return salB - salA;
      } else if (filters.sortBy === "salary-asc") {
        const salA = getLatestMedianSalary(a.instituteCode);
        const salB = getLatestMedianSalary(b.instituteCode);
        if (salA !== salB) {
          if (salA === 0) return 1;
          if (salB === 0) return -1;
          return salA - salB;
        }
      } else if (filters.sortBy === "placement-rate-desc") {
        const pctA = getLatestPlacementPercentage(a.instituteCode);
        const pctB = getLatestPlacementPercentage(b.instituteCode);
        if (pctA !== pctB) return pctB - pctA;
      } else if (filters.sortBy === "rank-asc") {
        if (a.minClosingRank !== b.minClosingRank) return a.minClosingRank - b.minClosingRank;
      } else if (filters.sortBy === "rank-desc") {
        if (a.minClosingRank === Infinity) return 1;
        if (b.minClosingRank === Infinity) return -1;
        if (a.minClosingRank !== b.minClosingRank) return b.minClosingRank - a.minClosingRank;
      }

      const pDiff = probOrder[a.maxProbability] - probOrder[b.maxProbability];
      if (pDiff !== 0) return pDiff;
      return a.minClosingRank - b.minClosingRank;
    });
  }, [filteredResults, filters.sortBy]);

  // Statistics for favorites/preferences
  const favStats = useMemo(() => {
    const stats = { NIT: 0, IIIT: 0, GFTI: 0, total: favorites.length, uniqueColleges: 0 };
    const uniqueCodes = new Set<number>();
    for (const f of favorites) {
      uniqueCodes.add(f.instituteCode);
      const t = f.instituteType.toUpperCase();
      if (t === "NIT") stats.NIT++;
      else if (t === "IIIT") stats.IIIT++;
      else if (t === "GFTI") stats.GFTI++;
    }
    stats.uniqueColleges = uniqueCodes.size;
    return stats;
  }, [favorites]);

  // Unique wishlisted colleges with details for printing
  const uniqueWishlistedColleges = useMemo(() => {
    const collegesMap: Record<number, {
      name: string;
      type: string;
      state: string;
      branches: string[];
      probabilities: string[];
    }> = {};
    
    for (const f of favorites) {
      if (!collegesMap[f.instituteCode]) {
        collegesMap[f.instituteCode] = {
          name: f.instituteName,
          type: f.instituteType,
          state: getInstituteState(f.instituteCode) || "Unknown",
          branches: [],
          probabilities: [],
        };
      }
      if (!collegesMap[f.instituteCode].branches.includes(f.programName)) {
        collegesMap[f.instituteCode].branches.push(f.programName);
      }
      if (!collegesMap[f.instituteCode].probabilities.includes(f.probability)) {
        collegesMap[f.instituteCode].probabilities.push(f.probability);
      }
    }
    return Object.values(collegesMap);
  }, [favorites]);

  const toggleFilter = (key: keyof Filters, value: string | number | boolean) => {
    setFilters((prev) => {
      if (key === "nearDomicile") {
        return { ...prev, nearDomicile: !prev.nearDomicile };
      }
      if (key === "minNirfRank" || key === "minMedianSalary" || key === "sortBy") {
        return { ...prev, [key]: value as string };
      }
      const arr = prev[key] as (string | number)[];
      const newArr = arr.includes(value as string | number)
        ? arr.filter((v) => v !== value)
        : [...arr, value as string | number];
      return { ...prev, [key]: newArr };
    });
  };

  const clearFilters = () => {
    setFilters({
      probability: [],
      collegeTypes: [],
      courseDurations: [],
      degrees: [],
      branches: [],
      states: [],
      nearDomicile: false,
      minNirfRank: "any",
      minMedianSalary: "any",
      sortBy: "probability",
    });
    setBranchSearch("");
    setStateSearch("");
  };


  const activeFilterCount = Object.values(filters).reduce((acc, val) => {
    if (typeof val === "boolean") return acc + (val ? 1 : 0);
    if (Array.isArray(val)) return acc + val.length;
    if (typeof val === "string" && val !== "any") return acc + 1;
    return acc;
  }, 0);


  // Probability counts
  const probCounts = useMemo(() => {
    const counts = { high: 0, medium: 0, low: 0 };
    let filtered = [...results];
    if (filters.collegeTypes.length > 0) {
      filtered = filtered.filter((r) =>
        filters.collegeTypes.some((ft) => {
          const subtype = getInstituteSubtype(r.instituteCode, r.instituteType);
          if (ft === "GFTI") return r.instituteType === "GFTI";
          return subtype === ft;
        })
      );
    }
    if (filters.courseDurations.length > 0) {
      filtered = filtered.filter((r) => filters.courseDurations.includes(r.programDuration));
    }
    if (filters.degrees.length > 0) {
      filtered = filtered.filter((r) =>
        filters.degrees.some((d) => {
          const degreeInfo = DEGREE_FILTERS.find((df) => df.value === d);
          if (!degreeInfo) return false;
          return degreeInfo.matchPatterns.some((p) => r.programType.includes(p));
        })
      );
    }
    if (filters.branches.length > 0) {
      filtered = filtered.filter((r) => filters.branches.includes(classifyBranch(r.programName)));
    }
    if (filters.nearDomicile && homeState) {
      const nearbyStates = NEARBY_STATES[homeState] || [];
      const allowedStates = [homeState, ...nearbyStates];
      filtered = filtered.filter((r) => allowedStates.includes(getInstituteState(r.instituteCode)));
    }
    if (filters.states.length > 0) {
      filtered = filtered.filter((r) => filters.states.includes(getInstituteState(r.instituteCode)));
    }

    for (const r of filtered) {
      counts[r.probability]++;
    }
    return counts;
  }, [results, filters, homeState]);

  const renderSidebar = (isMobile: boolean) => {
    if (isMobile && !showFilters) return null;

    const className = isMobile
      ? `cp-sidebar cp-card cp-mobile-only cp-sidebar-mobile-shown`
      : `cp-sidebar cp-card cp-desktop-only`;

    const style: React.CSSProperties = isMobile
      ? { padding: "24px", zIndex: 1050, position: "fixed" }
      : { padding: "24px" };

    return (
      <div className={className} style={style}>
        <div className="cp-sidebar-header cp-flex cp-items-center cp-justify-between cp-mb-md">
          <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--color-foreground)" }}>
            Filters <span style={{ fontWeight: 500, fontSize: "0.8125rem", color: "var(--color-muted-foreground)", marginLeft: "4px" }}>({filteredResults.length} matches)</span>
          </h3>
          <div className="cp-flex cp-items-center cp-gap-sm">
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="cp-btn-secondary" style={{ padding: "4px 8px", fontSize: "0.75rem", background: "transparent" }}>
                Clear all
              </button>
            )}
            <button
              onClick={() => setShowFilters(false)}
              className="cp-btn-secondary cp-mobile-only"
              style={{ padding: "6px 12px", fontSize: "0.75rem", background: "none", border: "none", color: "var(--color-primary)", fontWeight: 700 }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Sort Results */}
        <div className="cp-filter-section">
          <h4 className="cp-filter-title">Sort Results By</h4>
          <select
            value={filters.sortBy}
            onChange={(e) => toggleFilter("sortBy", e.target.value)}
            className="cp-input cp-select"
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8125rem", background: "var(--color-card)", outline: "none", cursor: "pointer", fontWeight: 600 }}
          >
            <option value="probability">Admission Chance (Default)</option>
            <option value="nirf-asc">NIRF Rank: Top First</option>
            <option value="nirf-desc">NIRF Rank: Lower First</option>
            <option value="salary-desc">Salary: High to Low</option>
            <option value="salary-asc">Salary: Low to High</option>
            <option value="placement-rate-desc">Placement %: High to Low</option>
            <option value="rank-asc">Cutoff Rank: Most Competitive</option>
            <option value="rank-desc">Cutoff Rank: Least Competitive</option>
          </select>
        </div>

        {/* College Type */}
        <div className="cp-filter-section">
          <h4 className="cp-filter-title">College Type</h4>
          <div className="cp-flex cp-flex-col cp-gap-sm">
            {COLLEGE_TYPE_FILTERS.map((ct) => (
              <div key={ct.value} className="cp-checkbox-label">
                <input
                  type="checkbox"
                  id={`${isMobile ? 'm-' : ''}ct-${ct.value}`}
                  checked={filters.collegeTypes.includes(ct.value)}
                  onChange={() => toggleFilter("collegeTypes", ct.value)}
                  className="cp-checkbox"
                />
                <label htmlFor={`${isMobile ? 'm-' : ''}ct-${ct.value}`} style={{ fontSize: "0.8125rem", color: "var(--color-secondary-foreground)", cursor: "pointer", userSelect: "none", width: "100%" }}>
                  {ct.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Course Duration */}
        <div className="cp-filter-section">
          <h4 className="cp-filter-title">Course Duration</h4>
          <div className="cp-flex cp-flex-col cp-gap-sm">
            {COURSE_DURATIONS.map((cd) => (
              <div key={cd.value} className="cp-checkbox-label">
                <input
                  type="checkbox"
                  id={`${isMobile ? 'm-' : ''}cd-${cd.value}`}
                  checked={filters.courseDurations.includes(cd.value)}
                  onChange={() => toggleFilter("courseDurations", cd.value)}
                  className="cp-checkbox"
                />
                <label htmlFor={`${isMobile ? 'm-' : ''}cd-${cd.value}`} style={{ fontSize: "0.8125rem", color: "var(--color-secondary-foreground)", cursor: "pointer", userSelect: "none", width: "100%" }}>
                  {cd.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* Degree */}
        <div className="cp-filter-section">
          <h4 className="cp-filter-title">Degree</h4>
          <div className="cp-flex cp-flex-col cp-gap-sm">
            {DEGREE_FILTERS.map((d) => (
              <div key={d.value} className="cp-checkbox-label">
                <input
                  type="checkbox"
                  id={`${isMobile ? 'm-' : ''}d-${d.value}`}
                  checked={filters.degrees.includes(d.value)}
                  onChange={() => toggleFilter("degrees", d.value)}
                  className="cp-checkbox"
                />
                <label htmlFor={`${isMobile ? 'm-' : ''}d-${d.value}`} style={{ fontSize: "0.8125rem", color: "var(--color-secondary-foreground)", cursor: "pointer", userSelect: "none", width: "100%" }}>
                  {d.label}
                </label>
              </div>
            ))}
          </div>
        </div>

        {/* NIRF Ranking Filter */}
        <div className="cp-filter-section">
          <h4 className="cp-filter-title">NIRF Rank Category</h4>
          <select
            value={filters.minNirfRank}
            onChange={(e) => toggleFilter("minNirfRank", e.target.value)}
            className="cp-input cp-select"
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8125rem", background: "var(--color-card)", outline: "none", cursor: "pointer" }}
          >
            <option value="any">Any NIRF Ranking</option>
            <option value="top50">Top 50 Overall / Eng.</option>
            <option value="top100">Top 100 Overall / Eng.</option>
            <option value="top150">Top 150 Overall / Eng.</option>
            <option value="top200">Top 200 Overall / Eng.</option>
          </select>
        </div>

        {/* Median Salary Filter */}
        <div className="cp-filter-section">
          <h4 className="cp-filter-title">Min Median Salary</h4>
          <select
            value={filters.minMedianSalary}
            onChange={(e) => toggleFilter("minMedianSalary", e.target.value)}
            className="cp-input cp-select"
            style={{ width: "100%", padding: "8px 12px", borderRadius: "8px", fontSize: "0.8125rem", background: "var(--color-card)", outline: "none", cursor: "pointer" }}
          >
            <option value="any">Any Placement Salary</option>
            <option value="15">₹15 LPA & Above</option>
            <option value="12">₹12 LPA & Above</option>
            <option value="10">₹10 LPA & Above</option>
            <option value="8">₹8 LPA & Above</option>
            <option value="5">₹5 LPA & Above</option>
          </select>
        </div>

        {/* Branch Types */}
        <div className="cp-filter-section">
          <h4 className="cp-filter-title">Branch Types</h4>
          <input
            type="text"
            value={branchSearch}
            onChange={(e) => setBranchSearch(e.target.value)}
            placeholder="Search branches..."
            className="cp-search-input"
          />
          <div className="cp-filter-list">
            {BRANCH_CATEGORIES
              .filter((b) => b.label.toLowerCase().includes(branchSearch.toLowerCase()))
              .map((b) => (
                <div key={b.value} className="cp-checkbox-label" style={{ alignItems: "flex-start" }}>
                  <input
                    type="checkbox"
                    id={`${isMobile ? 'm-' : ''}b-${b.value}`}
                    checked={filters.branches.includes(b.value)}
                    onChange={() => toggleFilter("branches", b.value)}
                    className="cp-checkbox"
                    style={{ marginTop: "2px" }}
                  />
                  <label htmlFor={`${isMobile ? 'm-' : ''}b-${b.value}`} style={{ fontSize: "0.8125rem", color: "var(--color-secondary-foreground)", lineHeight: "1.3", cursor: "pointer", userSelect: "none", width: "100%" }}>
                    {b.label}
                  </label>
                </div>
              ))}
          </div>
        </div>

        {/* College State */}
        <div className="cp-filter-section" style={{ marginBottom: "20px" }}>
          <h4 className="cp-filter-title">College State</h4>
          <div className="cp-checkbox-label" style={{ marginBottom: "10px" }}>
            <input
              type="checkbox"
              id={`${isMobile ? 'm-' : ''}near-domicile-checkbox`}
              checked={filters.nearDomicile}
              onChange={() => toggleFilter("nearDomicile", true)}
              className="cp-checkbox"
            />
            <label htmlFor={`${isMobile ? 'm-' : ''}near-domicile-checkbox`} style={{ fontSize: "0.8125rem", fontWeight: 600, color: "var(--color-primary)", cursor: "pointer", userSelect: "none", width: "100%" }}>
              Near Domicile State
            </label>
          </div>
          <input
            type="text"
            value={stateSearch}
            onChange={(e) => setStateSearch(e.target.value)}
            placeholder="Search state..."
            className="cp-search-input"
          />
          <div className="cp-filter-list" style={{ maxHeight: "150px" }}>
            {INDIAN_STATES
              .filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()))
              .map((s) => (
                <div key={s} className="cp-checkbox-label">
                  <input
                    type="checkbox"
                    id={`${isMobile ? 'm-' : ''}s-${s}`}
                    checked={filters.states.includes(s)}
                    onChange={() => toggleFilter("states", s)}
                    className="cp-checkbox"
                  />
                  <label htmlFor={`${isMobile ? 'm-' : ''}s-${s}`} style={{ fontSize: "0.8125rem", color: "var(--color-secondary-foreground)", cursor: "pointer", userSelect: "none", width: "100%" }}>
                    {s}
                  </label>
                </div>
              ))}
          </div>
        </div>

        {/* Mobile Sticky Apply Button */}
        <div className="cp-mobile-only" style={{
          position: "sticky",
          bottom: "-20px",
          left: 0,
          right: 0,
          marginLeft: "-20px",
          marginRight: "-20px",
          marginBottom: "-20px",
          background: "var(--color-card)",
          padding: "16px 20px",
          borderTop: "1px solid var(--color-border)",
          zIndex: 30,
          boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.05)",
          marginTop: "16px"
        }}>
          <button
            onClick={() => setShowFilters(false)}
            className="cp-btn-primary"
            style={{ width: "100%", padding: "12px 20px", fontSize: "0.875rem" }}
          >
            Apply & View {filteredResults.length} Matches
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="relative min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-grid bg-radial-glow pointer-events-none cp-screen-only" />

      {/* Screen-only content container */}
      <div className="cp-screen-only relative cp-container cp-py-page">
        {/* Header */}
        <div className="cp-text-center cp-mb-lg">
          <h1 className="cp-section-title cp-mb-xs" style={{ fontSize: "2.5rem", color: "var(--color-primary)", background: "none", WebkitTextFillColor: "initial" }}>{title}</h1>
          <p className="cp-subtitle">{subtitle}</p>
        </div>

        {/* Form Wizard */}
        {!showResults && (
          <div className="cp-container-narrow">
            {/* Step indicators */}
            <div className="cp-step-container">
              {[1, 2].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => s < step && setStep(s)}
                  className={`cp-step-btn ${
                    step === s
                      ? "cp-step-btn-active"
                      : step > s
                      ? "cp-step-btn-done"
                      : "cp-step-btn-disabled"
                  }`}
                  disabled={step < s}
                >
                  {s === 1 ? "1. Personal Info" : "2. Rank Details"}
                </button>
              ))}
            </div>

            {/* Step 1: Personal Details */}
            {step === 1 && (
              <div className="cp-card cp-animate-fade-in">
                <div className="cp-grid cp-grid-2 cp-mb-md">
                  {/* Name */}
                  <div className="cp-flex-col">
                    <label className="cp-label" htmlFor="name">Name *</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="cp-input"
                    />
                  </div>
                  {/* Email */}
                  <div className="cp-flex-col">
                    <label className="cp-label" htmlFor="email">Email Address *</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="cp-input"
                    />
                  </div>
                </div>

                {/* Home State */}
                <div className="cp-flex-col cp-mb-md">
                  <label className="cp-label" htmlFor="homeState">Home State *</label>
                  <select
                    id="homeState"
                    value={homeState}
                    onChange={(e) => setHomeState(e.target.value)}
                    className="cp-input cp-select"
                  >
                    <option value="">Select your home state</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>{state}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="cp-flex-col cp-mb-md">
                  <label className="cp-label">Category *</label>
                  <div className="cp-segmented-control">
                    {CATEGORIES.map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setCategory(cat)}
                        className={`cp-segmented-item ${
                          category === cat ? "cp-segmented-item-active" : ""
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gender */}
                <div className="cp-flex-col cp-mb-lg">
                  <label className="cp-label">Gender *</label>
                  <div className="cp-segmented-control">
                    {GENDERS.map((g) => (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setGender(g)}
                        className={`cp-segmented-item ${
                          gender === g ? "cp-segmented-item-active" : ""
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!canProceedStep1}
                  className="cp-btn-primary"
                >
                  Continue to Rank Details
                </button>
              </div>
            )}

            {/* Step 2: Rank Details */}
            {step === 2 && (
              <div className="cp-card cp-animate-fade-in">
                {/* User summary */}
                <div className="cp-edit-summary-box cp-mb-md">
                  <div className="cp-edit-circle">
                    {name.charAt(0).toUpperCase()}
                  </div>
                  <div className="cp-flex-1" style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: "0.875rem" }}>{name}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)", marginTop: "2px" }}>
                      {homeState} • {category} • {gender}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="cp-btn-secondary"
                    style={{ padding: "6px 12px", fontSize: "0.75rem" }}
                  >
                    Edit
                  </button>
                </div>

                {/* CRL Rank */}
                <div className="cp-flex-col cp-mb-md">
                  <label className="cp-label" htmlFor="crlRank">
                    CRL (Common Rank List) Rank *
                  </label>
                  <input
                    id="crlRank"
                    type="number"
                    min="1"
                    value={crlRank}
                    onChange={(e) => setCrlRank(e.target.value)}
                    placeholder="e.g. 15000"
                    className="cp-input"
                    style={{ fontSize: "1.125rem", fontWeight: 600 }}
                  />
                </div>

                {/* Category Rank (JoSAA only) */}
                {type === "josaa" && category !== "OPEN" && (
                  <div className="cp-flex-col cp-mb-md">
                    <label className="cp-label" htmlFor="categoryRank">
                      {category} Category Rank <span style={{ textTransform: "none", fontWeight: "normal", color: "var(--color-muted-foreground)" }}>(Optional)</span>
                    </label>
                    <input
                      id="categoryRank"
                      type="number"
                      min="1"
                      value={categoryRank}
                      onChange={(e) => setCategoryRank(e.target.value)}
                      placeholder={`Enter your ${category} category rank`}
                      className="cp-input"
                    />
                    <p style={{ marginTop: "6px", fontSize: "0.75rem", color: "var(--color-muted-foreground)", lineHeight: "1.4" }}>
                      If provided, category rank will be used for seat allocation matching instead of CRL rank.
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={!canProceedStep2 || loading}
                  className="cp-btn-primary"
                  style={{ marginTop: "8px" }}
                >
                  {loading ? (
                    <span className="cp-flex cp-items-center cp-justify-center cp-gap-sm">
                      <svg className="cp-animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ animation: "spin 1s linear infinite" }}>
                        <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                        <path d="M4 12a8 8 0 018-8" strokeLinecap="round" />
                      </svg>
                      Analyzing Cutoffs...
                    </span>
                  ) : (
                    <>Predict Admission Chances</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Results */}
        {showResults && (
          <>
            {/* Mobile Filter Backdrop and Sidebar rendered outside the fade-in container to bypass containing block layout bugs */}
            {showFilters && (
              <div
                className="cp-drawer-overlay cp-mobile-only"
                onClick={() => setShowFilters(false)}
                style={{ zIndex: 1040 }}
              />
            )}
            {renderSidebar(true)}

            <div className="cp-animate-fade-in">
            {/* Results header */}
            <div className="cp-flex cp-flex-col cp-mb-md" style={{ gap: "16px", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <h2 className="cp-section-title" style={{ margin: 0 }}>
                  {filteredResults.length} Options at {groupedResults.length} Colleges
                </h2>
                <p style={{ fontSize: "0.875rem", color: "var(--color-muted-foreground)", marginTop: "4px" }}>
                  For CRL Rank <strong style={{ color: "var(--color-foreground)" }}>{Number(crlRank).toLocaleString()}</strong>
                  {categoryRank && category !== "OPEN" && (
                    <> • {category} Rank <strong style={{ color: "var(--color-foreground)" }}>{Number(categoryRank).toLocaleString()}</strong></>
                  )}
                  {" "}• {category} • {gender} • {homeState}
                </p>
              </div>
              <div className="cp-flex cp-items-center cp-gap-sm" style={{ flexWrap: "wrap", justifyContent: "space-between", width: "100%" }}>
                <div className="cp-flex cp-items-center cp-gap-sm">
                  <button
                    onClick={() => {
                      setShowResults(false);
                      setResults([]);
                      setStep(2);
                    }}
                    className="cp-btn-secondary"
                    style={{ border: "1px solid var(--color-border)", background: "#ffffff" }}
                  >
                    ← New Search
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "0.8125rem", color: "var(--color-secondary-foreground)", fontWeight: 600 }} className="cp-desktop-only">Sort By:</span>
                    <select
                      value={filters.sortBy}
                      onChange={(e) => toggleFilter("sortBy", e.target.value)}
                      className="cp-input cp-select"
                      style={{
                        padding: "8px 12px",
                        borderRadius: "8px",
                        fontSize: "0.8125rem",
                        background: "#ffffff",
                        border: "1px solid var(--color-border)",
                        outline: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        color: "var(--color-secondary-foreground)",
                        minWidth: "160px",
                      }}
                    >
                      <option value="probability">Chance (Default)</option>
                      <option value="nirf-asc">NIRF Rank: Top First</option>
                      <option value="nirf-desc">NIRF Rank: Lower First</option>
                      <option value="salary-desc">Salary: High to Low</option>
                      <option value="salary-asc">Salary: Low to High</option>
                      <option value="placement-rate-desc">Placement %: High to Low</option>
                      <option value="rank-asc">Cutoff: Competitive first</option>
                      <option value="rank-desc">Cutoff: Least competitive</option>
                    </select>
                  </div>
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="cp-btn-secondary cp-mobile-only"
                  style={{
                    border: "1px solid var(--color-border)",
                    background: showFilters || activeFilterCount > 0 ? "rgba(0, 122, 255, 0.08)" : "#ffffff",
                    borderColor: showFilters || activeFilterCount > 0 ? "rgba(0, 122, 255, 0.2)" : "var(--color-border)",
                    color: showFilters || activeFilterCount > 0 ? "var(--color-primary)" : "var(--color-secondary-foreground)",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                  {activeFilterCount > 0 && (
                    <span
                      className="cp-flex cp-items-center cp-justify-center"
                      style={{
                        background: "var(--color-primary)",
                        color: "#ffffff",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        fontSize: "9px",
                        fontWeight: 700,
                        marginLeft: "4px",
                      }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* Probability summary */}
            <div className="cp-grid cp-grid-3 cp-mb-md">
              {PROBABILITY_LEVELS.map((p) => {
                const isActive = filters.probability.includes(p.value as ProbabilityLevel);
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => toggleFilter("probability", p.value)}
                    className="cp-card cp-card-interactive"
                    style={{
                      padding: "16px",
                      textAlign: "center",
                      border: isActive ? `2px solid ${p.color}` : "2px solid var(--color-border)",
                      backgroundColor: isActive ? p.bgColor : "#ffffff",
                    }}
                  >
                    <div style={{ fontSize: "1.75rem", fontWeight: 800, color: p.color }}>
                      {probCounts[p.value as ProbabilityLevel]}
                    </div>
                    <div className="cp-label" style={{ fontSize: "0.625rem", margin: "4px 0 0 0" }}>
                      {p.label} Chance
                    </div>
                  </button>
                );
              })}
            </div>

             <div className="cp-predictor-layout">
              {/* Filter Sidebar (Desktop-only inside the layout) */}
              {renderSidebar(false)}

              {/* Results Output */}
              <div className="cp-results-panel">
                {filteredResults.length === 0 ? (
                  <div className="cp-card cp-text-center" style={{ padding: "48px" }}>
                    <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                      <SearchIcon style={{ width: "48px", height: "48px", color: "var(--color-muted-foreground)" }} />
                    </div>
                    <h3 className="cp-card-title">No results found</h3>
                    <p style={{ fontSize: "0.875rem", color: "var(--color-muted-foreground)", margin: 0 }}>
                      Try adjusting your filters or search with a different rank.
                    </p>
                  </div>
                ) : (
                  <div className="cp-flex-col cp-gap-lg">
                    {/* Desktop View: Grouped Colleges */}
                    <div className="cp-desktop-only">
                      <div className="cp-flex-col cp-gap-lg">
                        {groupedResults.slice(0, 100).map((college) => {
                          const isExpanded = expandedColleges.includes(college.instituteCode);
                          const isChartExpanded = expandedCharts.includes(college.instituteCode);
                          const allFav = college.programs.every((p) =>
                            favorites.some(
                              (f) =>
                                f.instituteCode === p.instituteCode &&
                                f.programName === p.programName &&
                                f.quota === p.quota &&
                                f.seatType === p.seatType
                            )
                          );
                          const someFav = college.programs.some((p) =>
                            favorites.some(
                              (f) =>
                                f.instituteCode === p.instituteCode &&
                                f.programName === p.programName &&
                                f.quota === p.quota &&
                                f.seatType === p.seatType
                            )
                          );
                          const isHomeState = college.state.toLowerCase() === homeState.toLowerCase();
                          const nirfInfo = NIRF_DATA[college.instituteCode];
                          const latestRanking = nirfInfo && nirfInfo.rankings && nirfInfo.rankings.length > 0
                            ? nirfInfo.rankings[nirfInfo.rankings.length - 1]
                            : null;
                          return (
                            <div key={college.instituteCode} className="cp-card cp-card-hover cp-mb-md" style={{ padding: "24px", borderLeft: isHomeState ? "6px solid #10b981" : undefined }}>
                              {/* College Header */}
                              <div
                                onClick={() => toggleCollegeExpanded(college.instituteCode)}
                                style={{
                                  borderBottom: isExpanded ? "1px solid var(--color-border)" : "none",
                                  paddingBottom: "12px",
                                  cursor: "pointer",
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "flex-start",
                                  gap: "24px",
                                  width: "100%",
                                }}
                              >
                                <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, minWidth: 0 }}>
                                  {/* Badges Row */}
                                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                                    <span className={`cp-badge-inst cp-badge-inst-${college.instituteType.toLowerCase()}`} style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                                      {college.instituteType}
                                    </span>
                                    {latestRanking && (
                                      <span style={{
                                        background: typeof latestRanking.rank === "number" && latestRanking.rank <= 10
                                          ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                          : typeof latestRanking.rank === "number" && latestRanking.rank <= 30
                                          ? "linear-gradient(135deg, #94a3b8 0%, #475569 100%)"
                                          : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                        color: "#ffffff",
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px"
                                      }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                                        NIRF #{latestRanking.rank}
                                      </span>
                                    )}

                                    {isHomeState && (
                                      <span style={{
                                        backgroundColor: "rgba(16, 185, 129, 0.12)",
                                        color: "#10b981",
                                        border: "1px solid rgba(16, 185, 129, 0.2)",
                                        padding: "4px 8px",
                                        borderRadius: "6px",
                                        fontSize: "0.75rem",
                                        fontWeight: 700,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px"
                                      }}>
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        Home State
                                      </span>
                                    )}
                                  </div>

                                  {/* College Name & Details */}
                                  <div>
                                    <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "var(--color-foreground)", margin: "4px 0 6px 0", lineHeight: "1.35" }}>
                                      {college.instituteName}
                                    </h3>
                                    <p style={{ fontSize: "0.75rem", color: "var(--color-muted-foreground)", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
                                      <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                                        <MapPinIcon /> {college.state}
                                      </span>
                                      <span>•</span>
                                      <span style={{ fontWeight: 600, color: "var(--color-foreground)" }}>
                                        {college.programs.length} {college.programs.length === 1 ? "branch" : "branches"}:
                                      </span>
                                      {college.counts.high > 0 && (
                                        <span className="cp-badge-prob cp-badge-prob-high" style={{ padding: "2px 6px", fontSize: "0.625rem", borderRadius: "4px" }}>
                                          {college.counts.high} High
                                        </span>
                                      )}
                                      {college.counts.medium > 0 && (
                                        <span className="cp-badge-prob cp-badge-prob-medium" style={{ padding: "2px 6px", fontSize: "0.625rem", borderRadius: "4px" }}>
                                          {college.counts.medium} Med
                                        </span>
                                      )}
                                      {college.counts.low > 0 && (
                                        <span className="cp-badge-prob cp-badge-prob-low" style={{ padding: "2px 6px", fontSize: "0.625rem", borderRadius: "4px" }}>
                                          {college.counts.low} Low
                                        </span>
                                      )}
                                    </p>
                                  </div>
                                </div>

                                {/* Header Actions */}
                                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", justifyContent: "flex-end", flexShrink: 0, marginTop: "2px" }} onClick={(e) => e.stopPropagation()}>
                                  {/* College Wishlist Toggle */}
                                  <button
                                    onClick={() => toggleCollegeFavorite(college.programs)}
                                    className={`cp-btn-secondary ${allFav ? "cp-fav-btn-active" : ""}`}
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "0.75rem",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                    }}
                                  >
                                    <StarIcon active={someFav} style={{ color: someFav ? "#ffb700" : "currentColor" }} />
                                    {allFav ? "All Wishlisted" : someFav ? "Add Remaining" : "Wishlist College"}
                                  </button>

                                  {NIRF_DATA[college.instituteCode] && (
                                    <button
                                      onClick={() => toggleNirfExpanded(college.instituteCode)}
                                      className="cp-btn-secondary"
                                      style={{
                                        padding: "6px 12px",
                                        fontSize: "0.75rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                        background: expandedNirf.includes(college.instituteCode) ? "var(--color-primary-light)" : undefined,
                                        color: expandedNirf.includes(college.instituteCode) ? "var(--color-primary)" : undefined,
                                        borderColor: expandedNirf.includes(college.instituteCode) ? "rgba(26, 115, 232, 0.3)" : undefined
                                      }}
                                    >
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                                      {expandedNirf.includes(college.instituteCode) ? "Hide NIRF Data" : "View NIRF & Placements"}
                                    </button>
                                  )}

                                  {isExpanded && (
                                    <button
                                      onClick={() => toggleChartExpanded(college.instituteCode)}
                                      className="cp-btn-secondary"
                                      style={{ padding: "6px 12px", fontSize: "0.75rem", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                    >
                                      <ChartBarIcon />
                                      {isChartExpanded ? "Hide Analytics" : "Compare Branches"}
                                    </button>
                                  )}

                                  <button
                                    onClick={() => toggleCollegeExpanded(college.instituteCode)}
                                    className="cp-btn-secondary"
                                    style={{
                                      padding: "6px 12px",
                                      fontSize: "0.75rem",
                                      display: "inline-flex",
                                      alignItems: "center",
                                      gap: "4px",
                                      background: isExpanded ? "var(--color-secondary)" : undefined
                                    }}
                                  >
                                    {isExpanded ? (
                                      <>Collapse ▲</>
                                    ) : (
                                      <>Expand Branches ▼</>
                                    )}
                                  </button>
                                </div>
                              </div>


                              {/* Expanded Content */}
                              {isExpanded && (
                                <div style={{ marginTop: "16px" }}>
                                  {/* NIRF Details and Placements Section */}
                                  {expandedNirf.includes(college.instituteCode) && (
                                    <NirfDetails instituteCode={college.instituteCode} />
                                  )}


                                  {/* Visual Analytics Recharts Chart */}
                                  {isChartExpanded && (
                                    <div className="cp-chart-container animate-fade-in" style={{ padding: "16px", background: "#f8f9fa", borderRadius: "12px", marginBottom: "20px" }}>
                                      <h4 style={{ fontSize: "0.875rem", fontWeight: 700, marginBottom: "16px", color: "var(--color-secondary-foreground)" }}>
                                        Closing Rank Cutoffs Comparison (Lower is harder to get in)
                                      </h4>
                                      <div style={{ width: "100%", height: Math.max(160, college.programs.length * 40) }}>
                                        <ResponsiveContainer width="100%" height="100%">
                                          <BarChart
                                            data={college.programs.map((p) => ({
                                              name: p.programName.length > 40 ? p.programName.substring(0, 38) + "..." : p.programName,
                                              "Closing Rank": p.closingRank,
                                            }))}
                                            layout="vertical"
                                            margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
                                          >
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" style={{ fontSize: "0.75rem" }} />
                                            <YAxis dataKey="name" type="category" width={180} style={{ fontSize: "0.6875rem" }} />
                                            <Tooltip
                                              // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                              formatter={(value: any) => [Number(value).toLocaleString(), "Closing Rank"]}
                                            />
                                            <Bar dataKey="Closing Rank" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={16} />
                                          </BarChart>
                                        </ResponsiveContainer>
                                      </div>
                                    </div>
                                  )}

                                  {/* College Branches Table */}
                                  <div className="cp-table-container">
                                    <table className="cp-table">
                                      <thead>
                                        <tr>
                                          <th style={{ padding: "8px 10px", width: "50px", textAlign: "center", borderTopLeftRadius: "8px" }}>
                                            <StarIcon active={false} style={{ margin: "0 auto", color: "var(--color-muted-foreground)" }} />
                                          </th>
                                          <th style={{ padding: "8px 10px", fontSize: "0.625rem" }}>Chance</th>
                                          <th style={{ padding: "8px 10px", fontSize: "0.625rem" }}>Program / Branch</th>
                                          <th style={{ padding: "8px 10px", fontSize: "0.625rem" }}>Duration & Degree</th>
                                          <th style={{ padding: "8px 10px", fontSize: "0.625rem" }}>Opening Rank</th>
                                          <th style={{ padding: "8px 10px", fontSize: "0.625rem" }}>Closing Rank</th>
                                          <th style={{ padding: "8px 10px", fontSize: "0.625rem" }}>Quota</th>
                                          <th style={{ padding: "8px 10px", fontSize: "0.625rem", borderTopRightRadius: "8px" }}>Seat Type</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {college.programs.map((r, idx) => {
                                          const isFav = favorites.some(
                                            (f) =>
                                              f.instituteCode === r.instituteCode &&
                                              f.programName === r.programName &&
                                              f.quota === r.quota &&
                                              f.seatType === r.seatType
                                          );
                                          const isCategoryMatch = r.seatType.toLowerCase() === category.toLowerCase() && category.toLowerCase() !== "open";
                                          return (
                                            <tr key={idx} style={{ backgroundColor: isCategoryMatch ? "rgba(99, 102, 241, 0.04)" : undefined }}>
                                              <td style={{ padding: "10px", textAlign: "center" }}>
                                                <button
                                                  onClick={() => toggleFavorite(r)}
                                                  className={`cp-fav-btn ${isFav ? "cp-fav-btn-active" : ""}`}
                                                  title={isFav ? "Remove from Choice List" : "Add to Choice List"}
                                                >
                                                  <StarIcon active={isFav} style={{ color: isFav ? "#ffb700" : "currentColor" }} />
                                                </button>
                                              </td>
                                              <td style={{ padding: "10px" }}>
                                                <span className={`cp-badge-prob cp-badge-prob-${r.probability}`} style={{ padding: "2px 6px", fontSize: "0.6875rem" }}>
                                                  <StatusDot type={r.probability} />
                                                  {r.probability}
                                                </span>
                                              </td>
                                              <td style={{ padding: "10px", fontWeight: 600, fontSize: "0.8125rem" }}>
                                                {r.programName}
                                              </td>
                                              <td style={{ padding: "10px", fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>
                                                {r.programDuration} Years • {r.programType.length > 25 ? r.programType.substring(0, 23) + "..." : r.programType}
                                              </td>
                                              <td className="cp-mono" style={{ padding: "10px", fontSize: "0.75rem" }}>{r.openingRank.toLocaleString()}</td>
                                              <td className="cp-mono" style={{ padding: "10px", fontSize: "0.75rem", fontWeight: 700 }}>{r.closingRank.toLocaleString()}</td>
                                              <td style={{ padding: "10px", fontSize: "0.75rem", color: "var(--color-muted-foreground)" }}>{JOSAA_QUOTAS[r.quota] || r.quota}</td>
                                              <td style={{ padding: "10px", fontSize: "0.75rem" }}>
                                                 {isCategoryMatch ? (
                                                   <span style={{
                                                     backgroundColor: "rgba(99, 102, 241, 0.15)",
                                                     color: "var(--color-primary)",
                                                     border: "1px solid rgba(99, 102, 241, 0.3)",
                                                     padding: "3px 8px",
                                                     borderRadius: "4px",
                                                     fontWeight: 700,
                                                     display: "inline-flex",
                                                     alignItems: "center",
                                                     gap: "4px"
                                                   }}>
                                                     {r.seatType}
                                                     <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
                                                   </span>
                                                 ) : (
                                                   <span style={{ color: "var(--color-muted-foreground)" }}>{r.seatType}</span>
                                                 )}
                                               </td>
                                            </tr>
                                          );
                                        })}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Mobile View: Grouped Colleges */}
                    <div className="cp-mobile-only">
                      <div className="cp-flex-col cp-gap-lg">
                        {groupedResults.slice(0, 100).map((college) => {
                          const isExpanded = expandedColleges.includes(college.instituteCode);
                          const isChartExpanded = expandedCharts.includes(college.instituteCode);
                          const allFav = college.programs.every((p) =>
                            favorites.some(
                              (f) =>
                                f.instituteCode === p.instituteCode &&
                                f.programName === p.programName &&
                                f.quota === p.quota &&
                                f.seatType === p.seatType
                            )
                          );
                          const someFav = college.programs.some((p) =>
                            favorites.some(
                              (f) =>
                                f.instituteCode === p.instituteCode &&
                                f.programName === p.programName &&
                                f.quota === p.quota &&
                                f.seatType === p.seatType
                            )
                          );
                          const isHomeState = college.state.toLowerCase() === homeState.toLowerCase();
                          const nirfInfo = NIRF_DATA[college.instituteCode];
                          const latestRanking = nirfInfo && nirfInfo.rankings && nirfInfo.rankings.length > 0
                            ? nirfInfo.rankings[nirfInfo.rankings.length - 1]
                            : null;
                          return (
                            <div key={college.instituteCode} className="cp-card cp-mb-md" style={{ padding: "16px", borderLeft: isHomeState ? "6px solid #10b981" : undefined }}>
                              {/* Mobile College Header */}
                              <div
                                onClick={() => toggleCollegeExpanded(college.instituteCode)}
                                style={{
                                  cursor: "pointer",
                                  borderBottom: isExpanded ? "1px solid var(--color-border)" : "none",
                                  paddingBottom: "10px",
                                  marginBottom: "10px",
                                }}
                              >
                                <div className="cp-flex cp-justify-between cp-items-start">
                                  <div className="cp-flex cp-items-center cp-gap-xs" style={{ flexWrap: "wrap" }}>
                                    <span className={`cp-badge-inst cp-badge-inst-${college.instituteType.toLowerCase()}`} style={{ fontSize: "0.625rem", padding: "2px 6px", marginBottom: "6px" }}>
                                      {college.instituteType}
                                    </span>
                                    {latestRanking && (
                                      <span style={{
                                        background: typeof latestRanking.rank === "number" && latestRanking.rank <= 10
                                          ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                                          : typeof latestRanking.rank === "number" && latestRanking.rank <= 30
                                          ? "linear-gradient(135deg, #94a3b8 0%, #475569 100%)"
                                          : "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                                        color: "#ffffff",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "0.625rem",
                                        fontWeight: 700,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "2px",
                                        marginBottom: "6px"
                                      }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path></svg>
                                        NIRF #{latestRanking.rank}
                                      </span>
                                    )}

                                    {isHomeState && (
                                      <span style={{
                                        backgroundColor: "rgba(16, 185, 129, 0.12)",
                                        color: "#10b981",
                                        border: "1px solid rgba(16, 185, 129, 0.2)",
                                        padding: "2px 6px",
                                        borderRadius: "4px",
                                        fontSize: "0.625rem",
                                        fontWeight: 700,
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "2px",
                                        marginBottom: "6px"
                                      }}>
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                        Home State
                                      </span>
                                    )}
                                  </div>
                                  <span style={{ fontSize: "0.75rem", color: "var(--color-primary)", fontWeight: 600 }}>
                                    {isExpanded ? "Collapse ▲" : "Expand ▼"}
                                  </span>
                                </div>
                                <h3 style={{ fontSize: "0.9375rem", fontWeight: 700, color: "var(--color-foreground)", lineHeight: "1.4" }}>
                                  {college.instituteName}
                                </h3>
                                <p style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", marginTop: "2px", display: "flex", flexWrap: "wrap", gap: "6px", alignItems: "center" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
                                    <MapPinIcon style={{ width: "10px", height: "10px" }} /> {college.state}
                                  </span>
                                  <span>•</span>
                                  <span>{college.programs.length} branches:</span>
                                  {college.counts.high > 0 && (
                                    <span className="cp-badge-prob cp-badge-prob-high" style={{ padding: "1px 4px", fontSize: "0.5625rem", borderRadius: "3px" }}>
                                      {college.counts.high}H
                                    </span>
                                  )}
                                  {college.counts.medium > 0 && (
                                    <span className="cp-badge-prob cp-badge-prob-medium" style={{ padding: "1px 4px", fontSize: "0.5625rem", borderRadius: "3px" }}>
                                      {college.counts.medium}M
                                    </span>
                                  )}
                                  {college.counts.low > 0 && (
                                    <span className="cp-badge-prob cp-badge-prob-low" style={{ padding: "1px 4px", fontSize: "0.5625rem", borderRadius: "3px" }}>
                                      {college.counts.low}L
                                    </span>
                                  )}
                                </p>
                              </div>

                              {isExpanded && (
                                <div>
                                  {/* NIRF Details and Placements Section */}
                                  {expandedNirf.includes(college.instituteCode) && (
                                    <NirfDetails instituteCode={college.instituteCode} isMobile={true} />
                                  )}

                                  {/* Mobile Actions block */}
                                  <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginBottom: "12px" }}>
                                    {NIRF_DATA[college.instituteCode] && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleNirfExpanded(college.instituteCode);
                                        }}
                                        className="cp-btn-secondary"
                                        style={{
                                          padding: "4px 8px",
                                          fontSize: "0.6875rem",
                                          borderRadius: "6px",
                                          display: "inline-flex",
                                          alignItems: "center",
                                          gap: "4px",
                                          background: expandedNirf.includes(college.instituteCode) ? "var(--color-primary-light)" : undefined,
                                          color: expandedNirf.includes(college.instituteCode) ? "var(--color-primary)" : undefined,
                                          borderColor: expandedNirf.includes(college.instituteCode) ? "rgba(26, 115, 232, 0.3)" : undefined
                                        }}
                                      >
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>
                                        {expandedNirf.includes(college.instituteCode) ? "Hide NIRF" : "View NIRF"}
                                      </button>
                                    )}
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleCollegeFavorite(college.programs);
                                      }}
                                      className={`cp-btn-secondary ${allFav ? "cp-fav-btn-active" : ""}`}
                                      style={{
                                        padding: "4px 8px",
                                        fontSize: "0.6875rem",
                                        borderRadius: "6px",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        gap: "4px",
                                      }}
                                    >
                                      <StarIcon active={someFav} style={{ width: "10px", height: "10px", color: someFav ? "#ffb700" : "currentColor" }} />
                                      {allFav ? "All Wishlisted" : someFav ? "Add Remaining" : "Wishlist College"}
                                    </button>
                                    <button
                                      onClick={(e) => { e.stopPropagation(); toggleChartExpanded(college.instituteCode); }}
                                      className="cp-btn-secondary"
                                      style={{ padding: "4px 8px", fontSize: "0.6875rem", borderRadius: "6px", display: "inline-flex", alignItems: "center", gap: "4px" }}
                                    >
                                      <ChartBarIcon style={{ width: "12px", height: "12px" }} />
                                      {isChartExpanded ? "Hide Chart" : "Compare"}
                                    </button>
                                  </div>


                                  {/* Mobile Recharts Chart */}
                                  {isChartExpanded && (
                                    <div style={{ width: "100%", height: Math.max(140, college.programs.length * 35), marginBottom: "16px", padding: "8px", background: "#f8f9fa", borderRadius: "8px" }}>
                                      <ResponsiveContainer width="100%" height="100%">
                                        <BarChart
                                          data={college.programs.map((p) => ({
                                            name: p.programName.length > 20 ? p.programName.substring(0, 18) + "..." : p.programName,
                                            "Closing Rank": p.closingRank,
                                          }))}
                                          layout="vertical"
                                          margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
                                        >
                                          <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                          <XAxis type="number" style={{ fontSize: "0.5625rem" }} />
                                          <YAxis dataKey="name" type="category" width={80} style={{ fontSize: "0.5625rem" }} />
                                          <Tooltip
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            formatter={(value: any) => [Number(value).toLocaleString(), "Closing Rank"]}
                                          />
                                          <Bar dataKey="Closing Rank" fill="var(--color-primary)" radius={[0, 3, 3, 0]} barSize={10} />
                                        </BarChart>
                                      </ResponsiveContainer>
                                    </div>
                                  )}

                                  {/* Mobile Branches List */}
                                  <div className="cp-flex-col cp-gap-sm">
                                    {college.programs.map((r, idx) => {
                                      const isFav = favorites.some(
                                        (f) =>
                                          f.instituteCode === r.instituteCode &&
                                          f.programName === r.programName &&
                                          f.quota === r.quota &&
                                          f.seatType === r.seatType
                                      );
                                      const isCategoryMatch = r.seatType.toLowerCase() === category.toLowerCase() && category.toLowerCase() !== "open";
                                      return (
                                        <div key={idx} style={{
                                          padding: "8px",
                                          borderRadius: "8px",
                                          backgroundColor: isCategoryMatch ? "rgba(99, 102, 241, 0.04)" : undefined,
                                          border: isCategoryMatch ? "1px solid rgba(99, 102, 241, 0.1)" : "none",
                                          borderBottom: idx === college.programs.length - 1 ? "none" : (isCategoryMatch ? "1px solid rgba(99, 102, 241, 0.1)" : "1px solid rgba(0,0,0,0.05)"),
                                          marginBottom: "4px"
                                        }}>
                                          <div className="cp-flex cp-items-start cp-gap-md" style={{ width: "100%" }}>
                                            <button
                                              onClick={() => toggleFavorite(r)}
                                              className={`cp-fav-btn ${isFav ? "cp-fav-btn-active" : ""}`}
                                              style={{ width: "28px", height: "28px", fontSize: "0.75rem", flexShrink: 0, marginTop: "2px" }}
                                              title={isFav ? "Remove from Choice List" : "Add to Choice List"}
                                            >
                                              <StarIcon active={isFav} style={{ color: isFav ? "#ffb700" : "currentColor" }} />
                                            </button>
                                            <div className="cp-flex-1" style={{ minWidth: 0 }}>
                                              <div className="cp-flex cp-justify-between cp-items-start cp-gap-sm" style={{ marginBottom: "4px" }}>
                                                <div style={{ fontWeight: 600, fontSize: "0.8125rem", color: "var(--color-foreground)", lineHeight: "1.3" }}>
                                                  {r.programName}
                                                </div>
                                                <span className={`cp-badge-prob cp-badge-prob-${r.probability}`} style={{ padding: "1px 4px", fontSize: "0.625rem" }}>
                                                  <StatusDot type={r.probability} />
                                                </span>
                                              </div>
                                              <div style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", marginBottom: "6px" }}>
                                                {r.programDuration} Yrs • {r.programType} • {JOSAA_QUOTAS[r.quota] || r.quota} • {" "}
                                                {isCategoryMatch ? (
                                                  <span style={{
                                                    backgroundColor: "rgba(99, 102, 241, 0.15)",
                                                    color: "var(--color-primary)",
                                                    border: "1px solid rgba(99, 102, 241, 0.3)",
                                                    padding: "1px 6px",
                                                    borderRadius: "3px",
                                                    fontWeight: 700,
                                                    fontSize: "0.625rem",
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    gap: "2px"
                                                  }}>
                                                    {r.seatType} ★
                                                  </span>
                                                ) : (
                                                  r.seatType
                                                )}
                                              </div>
                                              <div className="cp-flex cp-justify-between" style={{ fontSize: "0.75rem" }}>
                                                <div>
                                                  <span className="cp-card-label" style={{ fontSize: "0.5rem" }}>Opening</span>
                                                  <span className="cp-mono" style={{ display: "block", fontWeight: 500 }}>{r.openingRank.toLocaleString()}</span>
                                                </div>
                                                <div style={{ textAlign: "right" }}>
                                                  <span className="cp-card-label" style={{ fontSize: "0.5rem" }}>Closing</span>
                                                  <span className="cp-mono" style={{ display: "block", fontWeight: 700 }}>{r.closingRank.toLocaleString()}</span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {groupedResults.length > 100 && (
                      <div className="cp-text-center" style={{ padding: "16px", borderTop: "1px solid var(--color-border)" }}>
                        <p style={{ fontSize: "0.8125rem", color: "var(--color-muted-foreground)", fontWeight: 500 }}>
                          Showing 100 of {groupedResults.length} colleges. Use filters to narrow down your search.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
          </>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="cp-flex-col cp-gap-md" style={{ marginTop: "32px" }}>
            {/* Desktop Skeletons */}
            <div className="cp-desktop-only cp-flex-col cp-gap-sm">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="cp-card" style={{ padding: "16px", display: "flex", gap: "16px", alignItems: "center" }}>
                  <div className="cp-skeleton" style={{ height: "24px", width: "80px" }} />
                  <div className="cp-skeleton cp-flex-1" style={{ height: "24px" }} />
                  <div className="cp-skeleton" style={{ height: "24px", width: "180px" }} />
                  <div className="cp-skeleton" style={{ height: "24px", width: "80px" }} />
                </div>
              ))}
            </div>
            {/* Mobile Skeletons */}
            <div className="cp-mobile-only cp-flex-col cp-gap-md">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="cp-card" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div className="cp-flex cp-justify-between">
                    <div className="cp-skeleton" style={{ height: "18px", width: "100px" }} />
                    <div className="cp-skeleton" style={{ height: "18px", width: "60px" }} />
                  </div>
                  <div className="cp-skeleton" style={{ height: "18px", width: "100%" }} />
                  <div className="cp-skeleton" style={{ height: "14px", width: "80%" }} />
                  <div className="cp-flex cp-justify-between" style={{ borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: "8px" }}>
                    <div className="cp-skeleton" style={{ height: "24px", width: "70px" }} />
                    <div className="cp-skeleton" style={{ height: "24px", width: "70px" }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Floating Choice List FAB */}
        {favorites.length > 0 && (
          <button
            onClick={() => setShowFavoritesDrawer(true)}
            className="cp-fab animate-fade-in"
            style={{ display: "inline-flex", gap: "8px" }}
          >
            <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <StarIcon active={true} style={{ color: "#ffffff", width: "16px", height: "16px" }} />
              Wishlist & Preferences
            </span>
            <span style={{
              background: "rgba(255, 255, 255, 0.2)",
              padding: "2px 8px",
              borderRadius: "10px",
              fontSize: "0.75rem",
              fontWeight: 800
            }}>
              {favorites.length}
            </span>
          </button>
        )}

        {/* Slide-over Choice Preference Drawer */}
        {showFavoritesDrawer && (
          <>
            <div className="cp-drawer-overlay" onClick={() => setShowFavoritesDrawer(false)} />
            <div className="cp-drawer">
              <div className="cp-drawer-header" style={{ padding: "16px 20px" }}>
                <div style={{ flex: 1, minWidth: 0, paddingRight: "8px" }}>
                  <div className="cp-flex cp-items-center cp-justify-between" style={{ width: "100%", gap: "8px" }}>
                    <h3 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>My Preference List</h3>
                    {favorites.length > 0 && (
                      <button
                        type="button"
                        onClick={clearAllFavorites}
                        className="cp-clear-all-btn"
                        title="Clear all selected choices"
                      >
                        <TrashIcon style={{ width: "12px", height: "12px" }} /> Clear All
                      </button>
                    )}
                  </div>
                  <p style={{ fontSize: "0.725rem", color: "var(--color-muted-foreground)", marginTop: "3px", margin: 0 }}>
                    Reorder and export your custom choice filling order.
                  </p>
                </div>
                <button
                  onClick={() => setShowFavoritesDrawer(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "1.5rem",
                    cursor: "pointer",
                    color: "var(--color-muted-foreground)",
                    padding: "4px",
                    lineHeight: 1
                  }}
                >
                  ×
                </button>
              </div>

              <div className="cp-drawer-body">
                {favorites.length === 0 ? (
                  <div className="cp-text-center" style={{ padding: "40px 0", color: "var(--color-muted-foreground)" }}>
                    <StarIcon active={false} style={{ width: "32px", height: "32px", color: "var(--color-muted-foreground)", margin: "0 auto 12px auto", display: "block" }} />
                    <p style={{ fontSize: "0.875rem", fontWeight: 600, margin: 0 }}>No choices selected</p>
                    <p style={{ fontSize: "0.75rem", marginTop: "4px", margin: 0 }}>Click the star icon (★) on branch rows or wishlist whole colleges to add them here.</p>
                  </div>
                ) : (
                  <div className="cp-flex-col">
                    {/* Google Color Scheme Statistics Badges */}
                    <div className="cp-stats-card">
                      <div className="cp-stats-header">
                        <span className="cp-stats-summary-text">Wishlist Summary</span>
                        <span className="cp-stats-badge cp-stats-badge-total">
                          {favStats.total} {favStats.total === 1 ? "Choice" : "Choices"}
                        </span>
                      </div>
                      <div className="cp-stats-badges-row">
                        <span className="cp-stats-badge cp-stats-badge-nit">
                          <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />
                          NITs: {favStats.NIT}
                        </span>
                        <span className="cp-stats-badge cp-stats-badge-iiit">
                          <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#ffffff" }} />
                          IIITs: {favStats.IIIT}
                        </span>
                        <span className="cp-stats-badge cp-stats-badge-gfti">
                          <span style={{ display: "inline-block", width: "6px", height: "6px", borderRadius: "50%", background: "#202124" }} />
                          GFTIs: {favStats.GFTI}
                        </span>
                        <span className="cp-stats-badge cp-stats-badge-unique">
                          Colleges: {favStats.uniqueColleges}
                        </span>
                      </div>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="cp-view-mode-toggle">
                      <div className="cp-segmented-control" style={{ padding: "2px" }}>
                        <button
                          type="button"
                          onClick={() => setDrawerViewMode("priority")}
                          className={`cp-segmented-item ${drawerViewMode === "priority" ? "cp-segmented-item-active" : ""}`}
                          style={{ fontSize: "0.75rem", padding: "6px 8px" }}
                        >
                          Priority Order
                        </button>
                        <button
                          type="button"
                          onClick={() => setDrawerViewMode("grouped")}
                          className={`cp-segmented-item ${drawerViewMode === "grouped" ? "cp-segmented-item-active" : ""}`}
                          style={{ fontSize: "0.75rem", padding: "6px 8px" }}
                        >
                          Grouped by College
                        </button>
                      </div>
                    </div>

                    {/* Preferences Render */}
                    {drawerViewMode === "priority" ? (
                      <div className="cp-flex-col">
                        {favorites.map((fav, index) => (
                          <div
                            key={getFavKey(fav)}
                            className={`cp-pref-card cp-pref-card-${fav.probability}`}
                            style={{ flexDirection: "column", alignItems: "stretch" }}
                          >
                            <div className="cp-flex cp-items-center" style={{ width: "100%", gap: "12px" }}>
                              {/* Direct numeric input reordering */}
                              <input
                                type="number"
                                min="1"
                                max={favorites.length}
                                className="cp-pref-num-input"
                                defaultValue={index + 1}
                                key={`input-${index}-${favorites.length}`}
                                onBlur={(e) => {
                                  const val = Number(e.target.value);
                                  if (val >= 1 && val <= favorites.length && val !== index + 1) {
                                    moveFavoriteToPosition(index, val);
                                  } else {
                                    e.target.value = String(index + 1);
                                  }
                                }}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const val = Number((e.target as HTMLInputElement).value);
                                    if (val >= 1 && val <= favorites.length && val !== index + 1) {
                                      moveFavoriteToPosition(index, val);
                                    } else {
                                      (e.target as HTMLInputElement).value = String(index + 1);
                                    }
                                    (e.target as HTMLInputElement).blur();
                                  }
                                }}
                              />

                              <div className="cp-flex-1" style={{ minWidth: 0, paddingRight: "8px" }}>
                                <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--color-foreground)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={fav.instituteName}>
                                  {fav.instituteName}
                                </h4>
                                <p style={{ fontSize: "0.75rem", color: "var(--color-secondary-foreground)", margin: "2px 0 0 0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={fav.programName}>
                                  {fav.programName}
                                </p>
                                <p style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", margin: "4px 0 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                                  Quota: {fav.quota} • Seat: {fav.seatType} •
                                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                                    <StatusDot type={fav.probability} />
                                    {fav.probability === "high" ? "High" : fav.probability === "medium" ? "Med" : "Low"}
                                  </span>
                                </p>
                              </div>

                              {/* Reorder up/down & delete */}
                              <div className="cp-flex cp-items-center cp-gap-xs">
                                <div className="cp-pref-controls">
                                  <button
                                    onClick={() => moveFavorite(index, "up")}
                                    disabled={index === 0}
                                    className="cp-pref-btn"
                                    title="Move Up"
                                  >
                                    <ChevronUpIcon />
                                  </button>
                                  <button
                                    onClick={() => moveFavorite(index, "down")}
                                    disabled={index === favorites.length - 1}
                                    className="cp-pref-btn"
                                    title="Move Down"
                                  >
                                    <ChevronDownIcon />
                                  </button>
                                </div>
                                <button
                                  onClick={() => toggleFavorite(fav)}
                                  className="cp-pref-btn"
                                  style={{ color: "var(--color-destructive)", marginLeft: "4px" }}
                                  title="Remove"
                                >
                                  <TrashIcon />
                                </button>
                              </div>
                            </div>
                            
                            {/* Note remark input */}
                            <input
                              type="text"
                              value={favoritesNotes[getFavKey(fav)] || ""}
                              onChange={(e) => setFavoritesNotes(prev => ({ ...prev, [getFavKey(fav)]: e.target.value }))}
                              placeholder="Add custom note/remark (e.g. Good placement, Top choice)..."
                              className="cp-remarks-input"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="cp-flex-col" style={{ gap: "12px" }}>
                        {groupedFavorites.map((group) => {
                          const isExpanded = expandedColleges.includes(group.instituteCode);
                          return (
                            <div
                              key={group.instituteCode}
                              style={{
                                border: "1px solid var(--color-border)",
                                borderRadius: "12px",
                                background: "#ffffff",
                                overflow: "hidden"
                              }}
                            >
                              {/* Group Header */}
                              <div
                                onClick={() => toggleCollegeExpanded(group.instituteCode)}
                                style={{
                                  padding: "12px 14px",
                                  background: "#f8f9fa",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  borderBottom: isExpanded ? "1px solid var(--color-border)" : "none"
                                }}
                              >
                                <div style={{ minWidth: 0, flex: 1, paddingRight: "8px" }}>
                                  <h4 style={{ fontSize: "0.8125rem", fontWeight: 700, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }} title={group.instituteName}>
                                    {group.instituteName}
                                  </h4>
                                  <p style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", margin: "2px 0 0 0" }}>
                                    {group.instituteType} • {group.state} • {group.programs.length} {group.programs.length === 1 ? "choice" : "choices"}
                                  </p>
                                </div>
                                <div>
                                  {isExpanded ? (
                                    <ChevronUpIcon style={{ color: "var(--color-muted-foreground)" }} />
                                  ) : (
                                    <ChevronDownIcon style={{ color: "var(--color-muted-foreground)" }} />
                                  )}
                                </div>
                              </div>

                              {/* Group Programs */}
                              {isExpanded && (
                                <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", gap: "8px", background: "#ffffff" }}>
                                  {group.programs.map(({ fav, originalIndex }) => (
                                    <div
                                      key={getFavKey(fav)}
                                      className={`cp-pref-card cp-pref-card-${fav.probability}`}
                                      style={{
                                        margin: 0,
                                        padding: "8px 10px",
                                        boxShadow: "none",
                                        flexDirection: "column",
                                        alignItems: "stretch"
                                      }}
                                    >
                                      <div className="cp-flex cp-items-center" style={{ width: "100%", gap: "10px" }}>
                                        <div className="cp-pref-num" style={{ width: "20px", height: "20px", fontSize: "0.7rem", flexShrink: 0 }}>
                                          {originalIndex + 1}
                                        </div>
                                        <div className="cp-flex-1" style={{ minWidth: 0 }}>
                                          <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--color-foreground)", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                            {fav.programName}
                                          </p>
                                          <p style={{ fontSize: "0.6875rem", color: "var(--color-muted-foreground)", margin: "2px 0 0 0" }}>
                                            Quota: {fav.quota} • Seat: {fav.seatType} •
                                            <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px" }}>
                                              <StatusDot type={fav.probability} />
                                              {fav.probability === "high" ? "High" : fav.probability === "medium" ? "Med" : "Low"}
                                            </span>
                                          </p>
                                        </div>
                                        <button
                                          onClick={() => toggleFavorite(fav)}
                                          className="cp-pref-btn"
                                          style={{ color: "var(--color-destructive)" }}
                                          title="Remove"
                                        >
                                          <TrashIcon />
                                        </button>
                                      </div>

                                      <input
                                        type="text"
                                        value={favoritesNotes[getFavKey(fav)] || ""}
                                        onChange={(e) => setFavoritesNotes(prev => ({ ...prev, [getFavKey(fav)]: e.target.value }))}
                                        placeholder="Add custom remark..."
                                        className="cp-remarks-input"
                                        style={{ marginTop: "6px", padding: "6px 8px", fontSize: "0.7rem" }}
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="cp-drawer-footer" style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {/* Print Layout Options */}
                {favorites.length > 0 && (
                  <div className="cp-flex-col" style={{ gap: "4px", marginBottom: "4px" }}>
                    <label className="cp-label" style={{ fontSize: "0.625rem", marginBottom: "2px" }}>PDF Report Type</label>
                    <div className="cp-segmented-control" style={{ background: "#f1f3f4", padding: "2px" }}>
                      <button
                        type="button"
                        onClick={() => setPrintType("branches")}
                        className={`cp-segmented-item ${printType === "branches" ? "cp-segmented-item-active" : ""}`}
                        style={{ fontSize: "0.75rem", padding: "6px" }}
                      >
                        Preferences ({favorites.length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setPrintType("colleges")}
                        className={`cp-segmented-item ${printType === "colleges" ? "cp-segmented-item-active" : ""}`}
                        style={{ fontSize: "0.75rem", padding: "6px" }}
                      >
                        Colleges ({favStats.uniqueColleges})
                      </button>
                    </div>
                  </div>
                )}

                <button
                  onClick={exportChoiceList}
                  disabled={favorites.length === 0}
                  className="cp-btn-primary"
                  style={{ width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
                >
                  <DownloadIcon /> Export Preferences (.txt)
                </button>
                <button
                  onClick={() => window.print()}
                  disabled={favorites.length === 0}
                  className="cp-btn-secondary"
                  style={{
                    width: "100%",
                    border: "1px solid var(--color-primary)",
                    color: "var(--color-primary)",
                    background: "rgba(0,122,255,0.04)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: "16px", height: "16px" }}>
                    <polyline points="6 9 6 2 18 2 18 9" />
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <rect x="6" y="14" width="12" height="8" />
                  </svg>
                  Print / Save PDF Report
                </button>
              </div>
            </div>
          </>
        )}

        {/* JoSAA / CSAB Counseling Roadmap & Steps */}
        <div className="cp-card cp-mb-xl" style={{ marginTop: '40px' }}>
          <h3 className="cp-card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px', color: 'var(--color-primary)' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            JoSAA / CSAB Counseling Roadmap & Guide
          </h3>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-secondary-foreground)', marginBottom: '20px' }}>
            Follow this timeline step-by-step to successfully navigate your seat allocation process.
          </p>
          <div className="cp-roadmap-grid">
            <div className="cp-roadmap-step cp-roadmap-step-active">
              <div className="cp-roadmap-num">01</div>
              <div className="cp-roadmap-title">Predict & Research</div>
              <div className="cp-roadmap-desc">Use this predictor tool to discover matching NITs, IIITs, and GFTIs for your rank.</div>
            </div>
            <div className="cp-roadmap-step">
              <div className="cp-roadmap-num">02</div>
              <div className="cp-roadmap-title">Wishlist & Notes</div>
              <div className="cp-roadmap-desc">Add favorite programs to your wishlist and insert custom remarks to rank options.</div>
            </div>
            <div className="cp-roadmap-step">
              <div className="cp-roadmap-num">03</div>
              <div className="cp-roadmap-title">Registration</div>
              <div className="cp-roadmap-desc">Register on the official JoSAA/CSAB portal when counseling registrations begin.</div>
            </div>
            <div className="cp-roadmap-step">
              <div className="cp-roadmap-num">04</div>
              <div className="cp-roadmap-title">Choice Filling</div>
              <div className="cp-roadmap-desc">Lock choices online in order of preference. Export your wishlist PDF as a guide.</div>
            </div>
            <div className="cp-roadmap-step">
              <div className="cp-roadmap-num">05</div>
              <div className="cp-roadmap-title">Seat Allocation</div>
              <div className="cp-roadmap-desc">Rounds of seat allocation. Choose Freeze, Slide, or Float and pay seat acceptance fee.</div>
            </div>
          </div>
        </div>
      </div> {/* Close the screen-only cp-container wrapper */}

      {/* Hidden PDF/Print Report Container - outside cp-container to prevent padding inheritance */}
      <div className="cp-print-report" style={{ display: "none", fontFamily: "'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif", color: "#1a1a2e", padding: "0 20px" }}>

        {/* ── Header ─────────────────────────────────── */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ height: "4px", background: "linear-gradient(90deg, #1a73e8, #5856d6, #34a853)", borderRadius: "4px", marginBottom: "20px" }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center" }}>
              <img src="/logo.png" alt="Logo" style={{ height: "38px", width: "auto" }} />
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "10px", color: "#5f6368", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "2px" }}>
                {type === "josaa" ? "JoSAA Counseling" : "CSAB Special Round"}
              </div>
              <div style={{ fontSize: "10px", color: "#80868b" }}>
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </div>
            </div>
          </div>
        </div>

        {/* ── Report Title ───────────────────────────── */}
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <h1 style={{ fontSize: "16px", fontWeight: 800, color: "#1a1a2e", margin: "0 0 4px 0", letterSpacing: "-0.01em", textTransform: "uppercase" }}>
            {printType === "branches" ? "Preference Wishlist Report" : "Wishlisted Colleges Summary"}
          </h1>
          <div style={{ width: "40px", height: "3px", background: "#1a73e8", borderRadius: "2px", margin: "8px auto 0 auto" }} />
        </div>

        {/* ── Candidate Info Card ────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0", marginBottom: "20px", border: "1px solid #e8eaed", borderTop: "3px solid #1a73e8", borderRadius: "8px", overflow: "hidden" }}>
          <div style={{ padding: "14px 18px", background: "#f8f9fa", borderRight: "1px solid #e8eaed" }}>
            <div style={{ fontSize: "9px", color: "#80868b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Candidate Details</div>
            <p style={{ margin: "3px 0", fontSize: "12px", color: "#3c4043" }}><span style={{ color: "#80868b", fontWeight: 500, display: "inline-block", width: "55px" }}>Name</span> <strong>{name || "-"}</strong></p>
            <p style={{ margin: "3px 0", fontSize: "12px", color: "#3c4043" }}><span style={{ color: "#80868b", fontWeight: 500, display: "inline-block", width: "55px" }}>Category</span> <strong>{category}</strong></p>
            <p style={{ margin: "3px 0", fontSize: "12px", color: "#3c4043" }}><span style={{ color: "#80868b", fontWeight: 500, display: "inline-block", width: "55px" }}>Gender</span> <strong>{gender}</strong></p>
          </div>
          <div style={{ padding: "14px 18px", background: "#f8f9fa" }}>
            <div style={{ fontSize: "9px", color: "#80868b", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px" }}>Rank & Location</div>
            <p style={{ margin: "3px 0", fontSize: "12px", color: "#3c4043" }}><span style={{ color: "#80868b", fontWeight: 500, display: "inline-block", width: "85px" }}>CRL Rank</span> <strong>{crlRank ? Number(crlRank).toLocaleString() : "N/A"}</strong></p>
            {categoryRank && (
              <p style={{ margin: "3px 0", fontSize: "12px", color: "#3c4043" }}><span style={{ color: "#80868b", fontWeight: 500, display: "inline-block", width: "85px" }}>Category Rank</span> <strong>{Number(categoryRank).toLocaleString()}</strong></p>
            )}
            <p style={{ margin: "3px 0", fontSize: "12px", color: "#3c4043" }}><span style={{ color: "#80868b", fontWeight: 500, display: "inline-block", width: "85px" }}>Home State</span> <strong>{homeState}</strong></p>
          </div>
        </div>

        {/* ── Summary Stats Row ──────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "8px", marginBottom: "24px" }}>
          {[
            { label: "Total Choices", value: favorites.length, color: "#1a73e8", bg: "#e8f0fe" },
            { label: "Unique Colleges", value: favStats.uniqueColleges, color: "#5856d6", bg: "#eee8ff" },
            { label: "NITs", value: favStats.NIT, color: "#1a73e8", bg: "#e8f0fe" },
            { label: "IIITs", value: favStats.IIIT, color: "#34a853", bg: "#e6f4ea" },
            { label: "GFTIs", value: favStats.GFTI, color: "#ea8600", bg: "#fef7e0" },
            { label: "High Chance", value: favorites.filter(f => f.probability === "high").length, color: "#137333", bg: "#e6f4ea" },
          ].map((s, idx) => (
            <div key={idx} style={{ textAlign: "center", padding: "10px 6px", background: s.bg, border: `1px solid ${s.color}25`, borderRadius: "8px" }}>
              <div style={{ fontSize: "18px", fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: "8px", color: "#5f6368", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginTop: "4px" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── Main Table ─────────────────────────────── */}
        {printType === "branches" ? (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "28px", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #1a73e8" }}>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>#</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Institute</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Program / Branch</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Quota</th>
                <th style={{ padding: "10px 8px", textAlign: "right", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Cutoff</th>
                <th style={{ padding: "10px 8px", textAlign: "center", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chance</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Notes</th>
              </tr>
            </thead>
            <tbody>
              {favorites.map((fav, i) => {
                const probColors: Record<string, { text: string; bg: string }> = {
                  high: { text: "#137333", bg: "#e6f4ea" },
                  medium: { text: "#b06000", bg: "#fef7e0" },
                  low: { text: "#c5221f", bg: "#fce8e6" },
                };
                const pc = probColors[fav.probability] || probColors.low;
                return (
                  <tr key={i} style={{ borderBottom: "1px solid #e8eaed", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                    <td style={{ padding: "8px", fontWeight: 700, color: "#5f6368", fontSize: "11px" }}>{i + 1}</td>
                    <td style={{ padding: "8px", fontWeight: 600, color: "#1a1a2e", fontSize: "11px", maxWidth: "180px" }}>
                      {fav.instituteName}
                      <div style={{ fontSize: "9px", color: "#80868b", fontWeight: 500, marginTop: "1px" }}>{fav.instituteType} • {fav.programDuration}yr</div>
                    </td>
                    <td style={{ padding: "8px", color: "#3c4043", fontSize: "11px" }}>{fav.programName}</td>
                    <td style={{ padding: "8px", color: "#5f6368", fontSize: "10px" }}>{fav.quota}<br/><span style={{ color: "#80868b" }}>{fav.seatType}</span></td>
                    <td style={{ padding: "8px", textAlign: "right", fontWeight: 700, fontSize: "11px", fontVariantNumeric: "tabular-nums", color: "#1a1a2e" }}>{fav.closingRank.toLocaleString()}</td>
                    <td style={{ padding: "8px", textAlign: "center" }}>
                      <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: "10px", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", background: pc.bg, color: pc.text }}>
                        {fav.probability}
                      </span>
                    </td>
                    <td style={{ padding: "8px", fontSize: "10px", color: "#5f6368", fontStyle: favoritesNotes[getFavKey(fav)] ? "italic" : "normal" }}>
                      {favoritesNotes[getFavKey(fav)] || "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "28px", fontSize: "11px" }}>
            <thead>
              <tr style={{ background: "#f8f9fa", borderBottom: "2px solid #1a73e8" }}>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>#</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>College</th>
                <th style={{ padding: "10px 8px", textAlign: "center", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Type</th>
                <th style={{ padding: "10px 8px", textAlign: "left", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>State</th>
                <th style={{ padding: "10px 8px", textAlign: "center", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Branches</th>
                <th style={{ padding: "10px 8px", textAlign: "center", fontSize: "9px", fontWeight: 700, color: "#1a1a2e", textTransform: "uppercase", letterSpacing: "0.06em" }}>Chances</th>
              </tr>
            </thead>
            <tbody>
              {uniqueWishlistedColleges.map((col, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #e8eaed", background: i % 2 === 0 ? "#fff" : "#fafbfc" }}>
                  <td style={{ padding: "8px", fontWeight: 700, color: "#5f6368", fontSize: "11px" }}>{i + 1}</td>
                  <td style={{ padding: "8px", fontWeight: 600, color: "#1a1a2e", fontSize: "11px" }}>{col.name}</td>
                  <td style={{ padding: "8px", textAlign: "center" }}>
                    <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: "6px", fontSize: "9px", fontWeight: 700, background: col.type === "NIT" ? "#e8f0fe" : col.type === "IIIT" ? "#e6f4ea" : "#fef7e0", color: col.type === "NIT" ? "#1a73e8" : col.type === "IIIT" ? "#137333" : "#b06000" }}>
                      {col.type}
                    </span>
                  </td>
                  <td style={{ padding: "8px", color: "#5f6368", fontSize: "11px" }}>{col.state}</td>
                  <td style={{ padding: "8px", textAlign: "center", fontWeight: 700, fontSize: "12px", color: "#1a1a2e" }}>{col.branches.length}</td>
                  <td style={{ padding: "8px", textAlign: "center", fontSize: "10px" }}>
                    {col.probabilities.map((p, pi) => {
                      const c = p === "high" ? { bg: "#e6f4ea", text: "#137333" } : p === "medium" ? { bg: "#fef7e0", text: "#b06000" } : { bg: "#fce8e6", text: "#c5221f" };
                      return <span key={pi} style={{ display: "inline-block", padding: "2px 8px", borderRadius: "10px", fontSize: "8px", fontWeight: 700, textTransform: "uppercase", background: c.bg, color: c.text, marginLeft: pi > 0 ? "3px" : "0" }}>{p}</span>;
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── Footer ─────────────────────────────────── */}
        <div style={{ marginTop: "auto" }}>
          <div style={{ height: "2px", background: "linear-gradient(90deg, #1a73e8, #5856d6, #34a853)", borderRadius: "2px", marginBottom: "16px" }} />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", fontSize: "9px", color: "#80868b" }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: "10px", color: "#3c4043", marginBottom: "3px" }}>JEE College Predictor</div>
              <div>Based on {type === "josaa" ? "JoSAA Round 6" : "CSAB Round 3"} historical cutoff data</div>
              <div style={{ marginTop: "2px" }}>This is a prediction tool - actual results may vary. Verify with official counseling portals.</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: "10px", color: "#3c4043", marginBottom: "3px" }}>jee.qzz.io</div>
              <div>Found this helpful?</div>
              <div style={{ fontWeight: 700, color: "#ff813f", marginTop: "2px" }}>☕ buymeacoffee.com/creatifying</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
