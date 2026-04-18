// Server-only: Google Cloud Storage upload helper
// Same implementation as resume-builder/src/lib/gcs.ts

import { Storage } from "@google-cloud/storage";

function getStorage(): Storage {
  const projectId = process.env.GCS_PROJECT_ID;
  const clientEmail = process.env.GCS_CLIENT_EMAIL;
  const privateKey = process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (clientEmail && privateKey && projectId) {
    return new Storage({
      projectId,
      credentials: { client_email: clientEmail, private_key: privateKey },
    });
  }

  // Falls back to GOOGLE_APPLICATION_CREDENTIALS env var or ADC
  return new Storage({ projectId });
}

const BUCKET_NAME = process.env.GCS_BUCKET_NAME ?? "gids_apps_assets";

export async function uploadToGCS(
  data: Buffer | Uint8Array,
  destPath: string,
  contentType: string,
): Promise<string> {
  const buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
  const storage = getStorage();
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(destPath);

  await file.save(buffer, {
    metadata: { contentType },
    resumable: false,
  });

  // Signed URL with 1-hour expiry (same as resume-builder)
  const [url] = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 1000 * 60 * 60,
  });

  return url;
}
