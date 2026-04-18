import { Resend } from "resend";
import type { AnswerRecord, FinalScore, InterviewMode } from "./types";

// Lazy init so build-time page-data collection doesn't throw on missing key
function getResend() {
  return new Resend(process.env.RESEND_API_KEY ?? "placeholder");
}
const FROM = process.env.RESEND_FROM_EMAIL ?? "coach@devfiesta.ai";

export async function sendInterviewReport(params: {
  email: string;
  nickname: string;
  mode: InterviewMode;
  answers: AnswerRecord[];
  finalScore: FinalScore;
  sessionId: string;
}): Promise<void> {
  const { email, nickname, mode, answers, finalScore, sessionId } = params;

  // Build a clean HTML report inline (no react-email rendering on edge)
  const modeLabel = mode === "roast" ? "🔥 Roast Mode" : "🎓 Coach Mode";
  const rankColors: Record<string, string> = {
    Senior: "#10b981",
    Mid: "#3b82f6",
    Junior: "#f59e0b",
    Intern: "#ef4444",
  };
  const rankColor = rankColors[finalScore.rank as keyof typeof rankColors] ?? "#7c3aed";

  const questionsHtml = answers
    .map(
      (a, i) => `
    <div style="margin-bottom:24px;padding:16px;background:#1e1e2e;border-radius:8px;border-left:4px solid ${a.feedback.score >= 7 ? "#10b981" : a.feedback.score >= 4 ? "#f59e0b" : "#ef4444"}">
      <p style="color:#94a3b8;font-size:12px;margin:0 0 4px">Q${i + 1} · ${a.questionText.slice(0, 100)}</p>
      <p style="color:#e2e8f0;margin:0 0 8px;font-size:14px">${a.answerText.slice(0, 300)}${a.answerText.length > 300 ? "…" : ""}</p>
      <div style="display:flex;gap:16px;font-size:12px;color:#94a3b8;margin-bottom:8px">
        <span>Score: <strong style="color:#fff">${a.feedback.score}/10</strong></span>
        <span>Accuracy: <strong style="color:#fff">${a.feedback.accuracy}%</strong></span>
        <span>Clarity: <strong style="color:#fff">${a.feedback.clarity}%</strong></span>
      </div>
      <p style="color:#cbd5e1;font-size:13px;margin:0">${a.feedback.detailedFeedback}</p>
      ${
        a.feedback.whatYouMissed.length > 0
          ? `<p style="color:#f87171;font-size:12px;margin:8px 0 0"><strong>Missed:</strong> ${a.feedback.whatYouMissed.join(" · ")}</p>`
          : ""
      }
      ${
        mode === "roast" && a.feedback.roastLine
          ? `<p style="color:#fb923c;font-size:12px;font-style:italic;margin:8px 0 0">💬 ${a.feedback.roastLine}</p>`
          : ""
      }
    </div>
  `,
    )
    .join("");

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="background:#0f0f1a;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e2e8f0;padding:32px;max-width:600px;margin:0 auto">
  <div style="text-align:center;margin-bottom:32px">
    <h1 style="color:#7c3aed;font-size:28px;margin:0">🎯 AI Interview Coach</h1>
    <p style="color:#94a3b8;margin:4px 0">Your Full Performance Report</p>
    <p style="color:#64748b;font-size:12px">${modeLabel} · Session ${sessionId.slice(0, 8)}</p>
  </div>

  <div style="background:#1e1e2e;border-radius:12px;padding:24px;margin-bottom:24px;text-align:center">
    <p style="color:#94a3b8;margin:0 0 4px;font-size:14px">Hey ${nickname}, here's how you did</p>
    <div style="font-size:64px;font-weight:bold;color:${rankColor}">${finalScore.overall}</div>
    <div style="font-size:13px;color:#94a3b8">out of 100</div>
    <div style="display:inline-block;background:${rankColor}22;color:${rankColor};padding:4px 16px;border-radius:999px;font-size:14px;font-weight:600;margin-top:8px">${finalScore.rank} Level</div>
    <div style="display:flex;justify-content:center;gap:24px;margin-top:16px">
      <div><div style="font-size:20px;font-weight:bold">${finalScore.accuracy}%</div><div style="font-size:11px;color:#64748b">Accuracy</div></div>
      <div><div style="font-size:20px;font-weight:bold">${finalScore.clarity}%</div><div style="font-size:11px;color:#64748b">Clarity</div></div>
      <div><div style="font-size:20px;font-weight:bold">${finalScore.consistency}%</div><div style="font-size:11px;color:#64748b">Consistency</div></div>
    </div>
    <p style="color:#cbd5e1;font-size:14px;margin:16px 0 0;line-height:1.6">${finalScore.summary}</p>
    ${finalScore.roastSummary ? `<p style="color:#fb923c;font-style:italic;font-size:13px;margin:8px 0 0">💀 ${finalScore.roastSummary}</p>` : ""}
  </div>

  <h2 style="font-size:16px;color:#94a3b8;margin-bottom:16px">Question-by-Question Breakdown</h2>
  ${questionsHtml}

  <div style="text-align:center;margin-top:32px;padding-top:24px;border-top:1px solid #1e1e2e">
    <p style="color:#475569;font-size:12px">AI Interview Coach · Developer Summit</p>
    <p style="color:#374151;font-size:11px">This report was generated automatically. Results are for educational purposes.</p>
  </div>
</body>
</html>`;

  await getResend().emails.send({
    from: FROM,
    to: email,
    subject: `Your Interview Report — ${finalScore.rank} Level (${finalScore.overall}/100) 🎯`,
    html,
  });
}
