import { initializeApp, getApps, cert, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

let adminApp: App;

export function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (projectId && clientEmail && privateKey) {
    adminApp = initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } else {
    adminApp = initializeApp({ projectId: projectId ?? 'astraverse-dev' });
  }

  return adminApp;
}

export async function verifyIdToken(token: string) {
  return getAuth(getAdminApp()).verifyIdToken(token);
}

export function isAdminConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}
