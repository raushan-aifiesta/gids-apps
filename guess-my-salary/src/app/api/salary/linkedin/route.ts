import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import "proxy-agent";

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN ?? "",
});

export async function POST(req: Request) {
  try {
    const { linkedinUrl } = (await req.json()) as { linkedinUrl?: string };

    if (!linkedinUrl) {
      return NextResponse.json(
        { error: "LinkedIn URL is required" },
        { status: 400 },
      );
    }

    const run = await apifyClient
      .actor("apimaestro/linkedin-profile-detail")
      .call({ username: linkedinUrl, includeEmail: true });

    const { items } = await apifyClient
      .dataset(run.defaultDatasetId)
      .listItems();
    const profile = items[0] as Record<string, unknown> | undefined;
    console.log(profile);

    if (!profile) {
      return NextResponse.json(
        { error: "Could not fetch LinkedIn profile" },
        { status: 404 },
      );
    }

    // Serialize LinkedIn profile to resume-like text
    const lines: string[] = [];

    const basic = profile.basic_info as Record<string, unknown> | undefined;
    if (basic) {
      if (basic.fullname) lines.push(`Name: ${basic.fullname}`);
      if (basic.headline) lines.push(`Headline: ${basic.headline}`);
      const loc = basic.location as Record<string, unknown> | undefined;
      if (loc?.full) lines.push(`Location: ${loc.full}`);
      if (basic.about) lines.push(`\nSummary:\n${basic.about}`);
      if (basic.current_company) lines.push(`Current Company: ${basic.current_company}`);
      const topSkills = basic.top_skills as string[] | undefined;
      if (topSkills?.length) lines.push(`\nTop Skills: ${topSkills.join(", ")}`);
    }

    const experience = profile.experience as Record<string, unknown>[] | undefined;
    if (experience?.length) {
      lines.push("\nWork Experience:");
      for (const exp of experience) {
        lines.push(
          `- ${exp.title ?? ""} at ${exp.company ?? ""} (${exp.duration ?? ""})${exp.employment_type ? ` · ${exp.employment_type}` : ""}`,
        );
        if (exp.location) lines.push(`  ${exp.location}`);
        if (exp.description) lines.push(`  ${exp.description}`);
      }
    }

    const education = profile.education as Record<string, unknown>[] | undefined;
    if (education?.length) {
      lines.push("\nEducation:");
      for (const edu of education) {
        lines.push(
          `- ${edu.degree_name ?? ""} in ${edu.field_of_study ?? ""} from ${edu.school ?? ""} (${edu.duration ?? ""})`,
        );
      }
    }

    const projects = profile.projects as Record<string, unknown>[] | undefined;
    if (projects?.length) {
      lines.push("\nProjects:");
      for (const proj of projects) {
        lines.push(`- ${proj.name ?? ""}`);
        if (proj.description) lines.push(`  ${proj.description}`);
      }
    }

    const resumeText = lines.join("\n");

    return NextResponse.json({ resumeText });
  } catch (error) {
    console.error("[salary/linkedin] error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "LinkedIn fetch failed",
      },
      { status: 500 },
    );
  }
}
