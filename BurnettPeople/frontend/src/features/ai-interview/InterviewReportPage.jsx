export default function InterviewReportPage({ onNavigate, sessionData }) {

  const EVALUATIONS = [
    {
      q: "How do you optimize Django ORM queries to prevent the N+1 queries problem?",
      score: 88,
      candidate:
        "In Django, I optimize queries primarily using select_related for ForeignKey/OneToOne joins, and prefetch_related for ManyToMany relationships, ensuring related instances are evaluated in minimal batch queries.",
      feedback:
        "Excellent explanation of select_related (SQL JOIN) vs prefetch_related (separate Python-level batch queries). You could further demonstrate seniority by mentioning iterator() for memory efficiency on huge querysets and EXPLAIN ANALYZE.",
      ideal:
        "Use select_related() when retrieving single-valued relationships (ForeignKey, OneToOne) as it performs an inner or left outer join in SQL. Use prefetch_related() for multi-valued relationships (ManyToManyField) which executes two queries and joins in Python. Furthermore, use .only() or .defer() to minimize column payload.",
    },
    {
      q: "Explain how PostgreSQL handles indexing on high-write tables, and when you would choose B-Tree over GIN/GiST.",
      score: 82,
      candidate:
        "B-Tree is best for scalar comparisons like equality and range queries on sequential data. For high write tables, unnecessary indexes cause write amplification because every INSERT/UPDATE updates the B-Tree index pages.",
      feedback:
        "Strong understanding of write amplification and index maintenance overhead. Mentioning HOT (Heap-Only Tuples) optimization in PostgreSQL would have earned a 95%+ score.",
      ideal:
        "B-Tree indexes are the default and most efficient for equality and range queries (=, <, >, BETWEEN). On high-write tables, each index increases WAL write volume and CPU cost. To mitigate this, ensure updates do not modify indexed columns to allow HOT (Heap-Only Tuple) optimization, and consider partial indexes.",
    },
  ];

  return (
    <div className="aii-content-wrap">
      {/* Breadcrumbs */}
      <div style={{ fontSize: "12px", color: "var(--bpi-text-muted)", marginBottom: "6px" }}>
        <span>AI Interview Platform</span> / <span>Report</span> / <span>Evaluation Results</span>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", margin: "0 0 4px", color: "var(--bpi-text-dark)" }}>
            Session Performance Report
          </h1>
          <p style={{ fontSize: "13.5px", color: "var(--bpi-text-muted)", margin: 0 }}>
            Session #{sessionData?.id || "INT-104"} &bull; Completed on {new Date().toLocaleDateString()}
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            className="aii-btn-secondary"
            onClick={() => window.print()}
          >
            Download PDF Report
          </button>
          <button
            type="button"
            className="aii-btn-primary"
            onClick={() => onNavigate("setup")}
          >
            Take Another Interview &rarr;
          </button>
        </div>
      </div>

      {/* Score Overview Card */}
      <div className="aii-card-panel" style={{ textAlign: "center", padding: "36px 24px" }}>
        <div className="aii-score-ring">
          <strong>84%</strong>
          <small>OVERALL</small>
        </div>
        <h2 style={{ fontSize: "22px", margin: "0 0 8px", color: "var(--bpi-text-dark)" }}>
          Performance Rating: Strong Candidate
        </h2>
        <p style={{ maxWidth: "580px", margin: "0 auto 28px", color: "var(--bpi-text-muted)", fontSize: "13.5px" }}>
          You demonstrated solid theoretical knowledge, precise framework terminology, and structured problem solving. Addressing trade-offs will push you into top percentile.
        </p>

        {/* 3 Metric Bars */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px", maxWidth: "800px", margin: "0 auto", textAlign: "left" }}>
          {[
            { label: "Technical Depth", val: 86, color: "#2563eb" },
            { label: "Clarity & Communication", val: 82, color: "#16a34a" },
            { label: "Relevance & Directness", val: 84, color: "#0891b2" },
          ].map((m) => (
            <div key={m.label} style={{ background: "var(--bpi-blue-soft)", padding: "14px 18px", borderRadius: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: "600", color: "var(--bpi-text-dark)" }}>{m.label}</span>
                <strong style={{ fontSize: "13px", color: m.color }}>{m.val}%</strong>
              </div>
              <div style={{ width: "100%", height: "6px", background: "#e2e8f0", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${m.val}%`, height: "100%", background: m.color, borderRadius: "3px" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strengths & Improvement Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "24px" }}>
        <div className="aii-card-panel" style={{ margin: 0 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: "#16a34a", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>✓</span> Key Strengths Demonstrated
          </h3>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: "1.7", color: "var(--bpi-text-dark)" }}>
            <li>Accurate understanding of ORM database query optimizations.</li>
            <li>Clear technical articulation with concise terminology.</li>
            <li>Recognized index maintenance trade-offs on high-write systems.</li>
          </ul>
        </div>

        <div className="aii-card-panel" style={{ margin: 0 }}>
          <h3 style={{ margin: "0 0 12px", fontSize: "15px", color: "#d97706", display: "flex", alignItems: "center", gap: "8px" }}>
            <span>▲</span> Recommended Focus Areas
          </h3>
          <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "13px", lineHeight: "1.7", color: "var(--bpi-text-dark)" }}>
            <li>Discuss execution plans (e.g. <code>EXPLAIN ANALYZE</code>) in database questions.</li>
            <li>Elaborate on production failure modes and rollback procedures.</li>
            <li>Structure behavioral answers more strictly using the STAR framework.</li>
          </ul>
        </div>
      </div>

      {/* Question by Question Detailed Breakdown */}
      <div className="aii-card-panel">
        <h3 style={{ margin: "0 0 20px", fontSize: "17px", fontWeight: "700" }}>Question-by-Question AI Analysis</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {EVALUATIONS.map((item, idx) => (
            <div
              key={idx}
              style={{
                border: "1px solid var(--bpi-card-border)",
                borderRadius: "12px",
                padding: "20px",
                background: "var(--bpi-card-bg)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", gap: "10px" }}>
                <h4 style={{ margin: 0, fontSize: "15px", color: "var(--bpi-text-dark)" }}>
                  Q{idx + 1}: {item.q}
                </h4>
                <span
                  style={{
                    background: "#ecfdf5",
                    color: "#16a34a",
                    fontSize: "12px",
                    fontWeight: "800",
                    padding: "3px 10px",
                    borderRadius: "999px",
                    flexShrink: 0,
                  }}
                >
                  {item.score}%
                </span>
              </div>

              {/* Candidate Answer */}
              <div style={{ background: "var(--bpi-blue-soft)", padding: "12px 16px", borderRadius: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "var(--bpi-primary)", display: "block", marginBottom: "4px" }}>
                  YOUR RESPONSE:
                </span>
                <p style={{ margin: 0, fontSize: "12.5px", lineHeight: "1.5", color: "var(--bpi-text-dark)" }}>
                  {item.candidate}
                </p>
              </div>

              {/* AI Evaluator Feedback */}
              <div style={{ marginBottom: "12px" }}>
                <span style={{ fontSize: "11.5px", fontWeight: "700", color: "#d97706", display: "block", marginBottom: "3px" }}>
                  AI COACH FEEDBACK:
                </span>
                <p style={{ margin: 0, fontSize: "12.5px", color: "var(--bpi-text-muted)", lineHeight: "1.5" }}>
                  {item.feedback}
                </p>
              </div>

              {/* Ideal Answer */}
              <div style={{ borderLeft: "3px solid #16a34a", paddingLeft: "12px" }}>
                <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", display: "block", marginBottom: "2px" }}>
                  BENCHMARK MODEL ANSWER:
                </span>
                <p style={{ margin: 0, fontSize: "12px", color: "var(--bpi-text-dark)", lineHeight: "1.5" }}>
                  {item.ideal}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
