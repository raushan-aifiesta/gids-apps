import { NextResponse } from "next/server";
import { ApifyClient } from "apify-client";
import "proxy-agent";

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_TOKEN ?? "",
});

async function scrapeGitHubProfile(username: string) {
  try {
    // Fetch user profile
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      headers: { Accept: "application/vnd.github.v3+json" },
    });
    if (!userRes.ok) throw new Error(`GitHub user not found: ${username}`);
    const profile = await userRes.json();

    // Fetch user repos (max 20)
    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=20&sort=stars&direction=desc`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
      },
    );
    if (!reposRes.ok) throw new Error("Failed to fetch GitHub repos");
    const repos = await reposRes.json();

    return {
      profile: {
        username: profile.login,
        name: profile.name,
        bio: profile.bio,
        location: profile.location,
        email: profile.email,
        blog: profile.blog,
        twitter: profile.twitter_username,
        profileUrl: profile.html_url,
        avatarUrl: profile.avatar_url,
        publicRepos: profile.public_repos,
        followers: profile.followers,
        following: profile.following,
      },
      repos: repos.map((r: Record<string, unknown>) => ({
        name: r.name,
        description: r.description,
        url: r.html_url,
        language: r.language,
        stars: r.stargazers_count,
        forks: r.forks_count,
      })),
    };
  } catch (error) {
    throw new Error(
      `GitHub scraping failed: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function POST(req: Request) {
  try {
    const { linkedInUrl, githubUsername } = await req.json();

    if (!linkedInUrl && !githubUsername) {
      return NextResponse.json(
        { error: "At least one of linkedInUrl or githubUsername is required" },
        { status: 400 },
      );
    }

    const results: { linkedIn?: unknown; github?: unknown } = {};

    const tasks: Promise<void>[] = [];

    if (linkedInUrl) {
      tasks.push(
        (async () => {
          const run = await apifyClient
            .actor("apimaestro/linkedin-profile-detail")
            .call({
              username: linkedInUrl,
              includeEmail: true,
            });
          const { items } = await apifyClient
            .dataset(run.defaultDatasetId)
            .listItems();
          results.linkedIn = items[0] ?? null;
          console.log("LinkedIn Profile:", items[0]);
        })(),
      );
    }

    if (githubUsername) {
      tasks.push(
        (async () => {
          const data = await scrapeGitHubProfile(githubUsername);
          results.github = data;
        })(),
      );
    }

    await Promise.all(tasks);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[scrape] error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scraping failed" },
      { status: 500 },
    );
  }
}
