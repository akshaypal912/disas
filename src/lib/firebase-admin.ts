import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

if (!getApps().length) {
  /**
   * FIX HIGH #9: firebase-admin requires a service account or Application Default
   * Credentials (ADC) to verify tokens server-side — projectId alone is insufficient.
   *
   * Priority order:
   * 1. GOOGLE_APPLICATION_CREDENTIALS env var (path to service account JSON) — used by ADC automatically.
   * 2. Explicit SERVICE_ACCOUNT_KEY_PATH env var pointing to the JSON file.
   * 3. Fall back to projectId-only init (works in GCP environments with ADC configured).
   */
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.SERVICE_ACCOUNT_KEY_PATH) {
    try {
      const keyPath = process.env.SERVICE_ACCOUNT_KEY_PATH || process.env.GOOGLE_APPLICATION_CREDENTIALS!;
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const serviceAccount = require(keyPath);
      initializeApp({ credential: cert(serviceAccount) });
    } catch {
      // Fall back to ADC if the explicit path fails
      initializeApp({ credential: applicationDefault() });
    }
  } else {
    // In GCP-hosted environments (Cloud Run, App Engine) ADC is automatic
    try {
      initializeApp({ credential: applicationDefault() });
    } catch {
      // Last resort: projectId only (dev/test only — verifyIdToken will fail)
      console.warn(
        '[firebase-admin] No service account credentials found. ' +
        'Set GOOGLE_APPLICATION_CREDENTIALS to your service account JSON path. ' +
        'Token verification will fail without valid credentials.'
      );
      initializeApp({ projectId: firebaseConfig.projectId });
    }
  }
}

export const adminAuth = getAuth();
