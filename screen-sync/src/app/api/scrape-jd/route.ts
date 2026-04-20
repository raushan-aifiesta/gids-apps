import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";

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
      .actor("ayk_6789/linkedin-job-details-scraper")
      .call({
        startUrls: [{ url: linkedinUrl }],
      });

    const { items } = await apifyClient
      .dataset(run.defaultDatasetId)
      .listItems();

    const job = items[0] as Record<string, unknown> | undefined;

    if (!job) {
      return NextResponse.json(
        { error: "Could not fetch job details" },
        { status: 404 },
      );
    }

    // Serialize job listing to JD text
    const parts: string[] = [];
    if (job.job_title) parts.push(`Job Title: ${job.job_title}`);
    if (job.company_name) parts.push(`Company: ${job.company_name}`);
    if (job.job_location) parts.push(`Location: ${job.job_location}`);
    if (job.job_employment_type) parts.push(`Employment Type: ${job.job_employment_type}`);
    if (job.job_seniority_level) parts.push(`Seniority Level: ${job.job_seniority_level}`);
    if (job.job_function) parts.push(`Job Function: ${job.job_function}`);
    if (job.job_industries) parts.push(`Industries: ${job.job_industries}`);
    if (job.workplace_type) parts.push(`Workplace Type: ${job.workplace_type}`);
    if (job.job_base_pay_range) parts.push(`Pay Range: ${job.job_base_pay_range}`);
    const expMin = job.experience_years_min as number | undefined;
    const expMax = job.experience_years_max as number | undefined;
    if (expMin != null || expMax != null) parts.push(`Experience: ${expMin ?? 0}–${expMax ?? "?"} years`);
    const skills = job.skills as string[] | undefined;
    if (skills?.length) parts.push(`\nRequired Skills: ${skills.join(", ")}`);
    if (job.job_description) parts.push(`\nJob Description:\n${job.job_description}`);

    const jdText = parts.join("\n").trim();

    if (!jdText) {
      return NextResponse.json(
        { error: "No text content found in the job post" },
        { status: 422 },
      );
    }

    return NextResponse.json({ jdText });
  } catch (error) {
    console.error("[scrape-jd] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scraping failed" },
      { status: 500 },
    );
  }
}
