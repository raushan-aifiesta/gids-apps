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
  return new Storage({ projectId });
}

const BUCKET_NAME = process.env.GCS_BUCKET_NAME ?? "gids_apps_assets";

export async function uploadJsonToGCS(
  data: unknown,
  destPath: string,
): Promise<void> {
  const buffer = Buffer.from(JSON.stringify(data, null, 2), "utf8");
  const storage = getStorage();
  const bucket = storage.bucket(BUCKET_NAME);
  const file = bucket.file(destPath);

  await file.save(buffer, {
    metadata: { contentType: "application/json" },
    resumable: false,
  });
}
