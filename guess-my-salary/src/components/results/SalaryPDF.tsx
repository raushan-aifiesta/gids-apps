import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import type { SalaryAnalysisResponse } from "@/lib/types";

const C = {
  indigo: "#4f46e5",
  indigoLight: "#eef2ff",
  green: "#059669",
  greenLight: "#ecfdf5",
  red: "#dc2626",
  redLight: "#fef2f2",
  amber: "#b45309",
  amberLight: "#fffbeb",
  gray900: "#111827",
  gray700: "#374151",
  gray500: "#6b7280",
  gray400: "#9ca3af",
  gray200: "#e5e7eb",
  gray100: "#f3f4f6",
  white: "#ffffff",
};

const s = StyleSheet.create({
  page: { fontFamily: "Helvetica", padding: 40, backgroundColor: C.white, fontSize: 10, color: C.gray700 },
  header: { marginBottom: 20, borderBottomWidth: 2, borderBottomColor: C.indigo, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontFamily: "Helvetica-Bold", color: C.gray900, marginBottom: 2 },
  headerSub: { fontSize: 10, color: C.gray500 },
  verdictBanner: { flexDirection: "row", alignItems: "center", borderRadius: 8, padding: 12, marginBottom: 14 },
  verdictLabel: { fontSize: 14, fontFamily: "Helvetica-Bold" },
  verdictNote: { fontSize: 9, color: C.gray500, marginTop: 2 },
  card: { borderWidth: 1, borderColor: C.gray200, borderRadius: 8, padding: 14, marginBottom: 12, backgroundColor: C.white },
  cardLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.gray400, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 },
  salaryRange: { fontSize: 28, fontFamily: "Helvetica-Bold", color: C.gray900, marginBottom: 2 },
  salaryMedian: { fontSize: 10, color: C.gray500 },
  oteBox: { backgroundColor: C.greenLight, borderRadius: 6, padding: 10, marginTop: 8 },
  oteLabel: { fontSize: 8, fontFamily: "Helvetica-Bold", color: C.green, marginBottom: 2 },
  oteRange: { fontSize: 18, fontFamily: "Helvetica-Bold", color: C.green },
  confidenceRow: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 10 },
  confidenceBar: { flex: 1, height: 6, backgroundColor: C.gray200, borderRadius: 3 },
  confidenceFill: { height: 6, borderRadius: 3 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 11, fontFamily: "Helvetica-Bold", color: C.gray900, marginBottom: 8, paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: C.gray200 },
  bulletRow: { flexDirection: "row", marginBottom: 4 },
  bullet: { width: 12, color: C.indigo, fontFamily: "Helvetica-Bold" },
  bulletText: { flex: 1, fontSize: 10, color: C.gray700, lineHeight: 1.4 },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  skill: { backgroundColor: C.gray100, borderRadius: 4, paddingHorizontal: 7, paddingVertical: 3, fontSize: 8, color: C.gray700 },
  roastBox: { backgroundColor: C.indigoLight, borderRadius: 6, padding: 10, marginTop: 4 },
  roastText: { fontSize: 9, color: C.indigo, fontFamily: "Helvetica-Oblique", lineHeight: 1.5 },
  profileRow: { flexDirection: "row", gap: 16 },
  profileItem: { flex: 1 },
  profileKey: { fontSize: 8, color: C.gray400, fontFamily: "Helvetica-Bold", textTransform: "uppercase", marginBottom: 2 },
  profileVal: { fontSize: 10, color: C.gray700 },
  footer: { position: "absolute", bottom: 28, left: 40, right: 40, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: C.gray400 },
});

function verdictColors(label: string) {
  const u = label.toUpperCase();
  if (u.includes("UNDERPAID")) return { bg: C.redLight, text: C.red };
  if (u.includes("OVERPAID")) return { bg: C.greenLight, text: C.green };
  return { bg: C.amberLight, text: C.amber };
}

function confidenceColor(c: number) {
  if (c >= 0.75) return C.green;
  if (c >= 0.5) return C.amber;
  return C.red;
}

export function SalaryPDF({ result }: { result: SalaryAnalysisResponse }) {
  const { profile, prediction, explanation } = result;
  const vc = verdictColors(explanation.verdict_label);
  const confPct = Math.round(prediction.confidence * 100);

  return (
    <Document>
      <Page size="A4" style={s.page}>
        {/* Header */}
        <View style={s.header}>
          <Text style={s.headerTitle}>Salary Market Report</Text>
          <Text style={s.headerSub}>
            {profile.current_role}
            {profile.location ? `  ·  ${profile.location}` : ""}
            {profile.years_experience > 0 ? `  ·  ${profile.years_experience} yrs experience` : ""}
          </Text>
        </View>

        {/* Verdict banner */}
        <View style={[s.verdictBanner, { backgroundColor: vc.bg }]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.verdictLabel, { color: vc.text }]}>{explanation.verdict_label}</Text>
            <Text style={s.verdictNote}>{explanation.percentile_note}</Text>
          </View>
          <Text style={{ fontSize: 9, color: C.gray500 }}>{explanation.profile_tier}</Text>
        </View>

        {/* Salary range card */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Predicted Market Salary · India</Text>
          <Text style={s.salaryRange}>
            ₹{prediction.min}L – ₹{prediction.max}L
          </Text>
          <Text style={s.salaryMedian}>Median: ₹{prediction.median}L per year</Text>

          {prediction.compensation_type === "variable" && prediction.ote_min != null && (
            <View style={s.oteBox}>
              <Text style={s.oteLabel}>OTE (On-Target Earnings at 100% quota)</Text>
              <Text style={s.oteRange}>₹{prediction.ote_min}L – ₹{prediction.ote_max}L</Text>
            </View>
          )}

          <View style={s.confidenceRow}>
            <Text style={{ fontSize: 9, color: C.gray500, width: 70 }}>Confidence {confPct}%</Text>
            <View style={s.confidenceBar}>
              <View style={[s.confidenceFill, { width: `${confPct}%`, backgroundColor: confidenceColor(prediction.confidence) }]} />
            </View>
          </View>
        </View>

        {/* Profile snapshot */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Profile Snapshot</Text>
          <View style={s.profileRow}>
            {profile.companies.length > 0 && (
              <View style={s.profileItem}>
                <Text style={s.profileKey}>Companies</Text>
                <Text style={s.profileVal}>{profile.companies.slice(0, 3).join(", ")}</Text>
              </View>
            )}
            {profile.education && (
              <View style={s.profileItem}>
                <Text style={s.profileKey}>Education</Text>
                <Text style={s.profileVal}>{profile.education}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Skills */}
        {profile.skills.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardLabel}>Skills Detected</Text>
            <View style={s.skillsWrap}>
              {profile.skills.slice(0, 24).map((sk) => (
                <View key={sk} style={s.skill}>
                  <Text>{sk}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Summary */}
        <View style={s.section}>
          <Text style={s.sectionTitle}>Analysis Summary</Text>
          <Text style={{ fontSize: 10, color: C.gray700, lineHeight: 1.5 }}>{explanation.summary}</Text>
        </View>

        {/* Strengths */}
        {explanation.strengths.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Strengths</Text>
            {explanation.strengths.map((s_, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>•</Text>
                <Text style={s.bulletText}>{s_}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Gaps */}
        {explanation.gaps.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Gaps</Text>
            {explanation.gaps.map((g, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>•</Text>
                <Text style={s.bulletText}>{g}</Text>
              </View>
            ))}
          </View>
        )}

        {/* How to improve */}
        {explanation.how_to_improve.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>How to Reach the Ceiling</Text>
            {explanation.how_to_improve.map((tip, i) => (
              <View key={i} style={s.bulletRow}>
                <Text style={s.bullet}>→</Text>
                <Text style={s.bulletText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Salary ceiling + aspiration */}
        <View style={s.card}>
          <Text style={s.cardLabel}>Ceiling & Aspiration</Text>
          <View style={s.bulletRow}>
            <Text style={s.bullet}>↑</Text>
            <Text style={s.bulletText}>{explanation.salary_ceiling}</Text>
          </View>
          <View style={s.bulletRow}>
            <Text style={s.bullet}>→</Text>
            <Text style={s.bulletText}>{explanation.gap_to_top_tier}</Text>
          </View>
          <View style={[s.bulletRow, { marginTop: 4 }]}>
            <Text style={s.bullet}>★</Text>
            <Text style={s.bulletText}>{explanation.aspiration_comparison}</Text>
          </View>
        </View>

        {/* Roast */}
        {explanation.roast && (
          <View style={s.roastBox}>
            <Text style={s.roastText}>"{explanation.roast}"</Text>
          </View>
        )}

        {/* Footer */}
        <View style={s.footer} fixed>
          <Text>Powered by mesh_api · meshapi.ai</Text>
          <Text render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
