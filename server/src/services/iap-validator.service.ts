import { env } from "../env.js";

interface ValidationResult {
  valid: boolean;
  productId: string;
  transactionId: string | null;
  expiresAt: Date | null;
  error?: string;
}

export async function validateAppleReceipt(
  receiptData: string,
): Promise<ValidationResult> {
  if (!env.APPLE_SHARED_SECRET) {
    return { valid: false, productId: "", transactionId: null, expiresAt: null, error: "Apple validation not configured" };
  }

  const response = await fetch("https://buy.itunes.apple.com/verifyReceipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "receipt-data": receiptData,
      password: env.APPLE_SHARED_SECRET,
      "exclude-old-transactions": true,
    }),
  });

  const data = (await response.json()) as {
    status: number;
    latest_receipt_info?: Array<{
      product_id: string;
      transaction_id: string;
      expires_date_ms?: string;
    }>;
  };

  if (data.status === 21007) {
    const sandboxResponse = await fetch("https://sandbox.itunes.apple.com/verifyReceipt", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        "receipt-data": receiptData,
        password: env.APPLE_SHARED_SECRET,
        "exclude-old-transactions": true,
      }),
    });
    const sandboxData = (await sandboxResponse.json()) as typeof data;
    return parseAppleResponse(sandboxData);
  }

  return parseAppleResponse(data);
}

function parseAppleResponse(data: {
  status: number;
  latest_receipt_info?: Array<{
    product_id: string;
    transaction_id: string;
    expires_date_ms?: string;
  }>;
}): ValidationResult {
  if (data.status !== 0) {
    return { valid: false, productId: "", transactionId: null, expiresAt: null, error: `Apple status ${data.status}` };
  }

  const latest = data.latest_receipt_info?.[0];
  if (!latest) {
    return { valid: false, productId: "", transactionId: null, expiresAt: null, error: "No receipt info" };
  }

  return {
    valid: true,
    productId: latest.product_id,
    transactionId: latest.transaction_id,
    expiresAt: latest.expires_date_ms
      ? new Date(parseInt(latest.expires_date_ms, 10))
      : null,
  };
}

export async function validateGoogleReceipt(
  productId: string,
  purchaseToken: string,
): Promise<ValidationResult> {
  if (!env.GOOGLE_SERVICE_ACCOUNT_KEY) {
    return { valid: false, productId: "", transactionId: null, expiresAt: null, error: "Google validation not configured" };
  }

  const accessToken = await getGoogleAccessToken();
  const packageName = "com.falatorio.app";

  const isSubscription = productId.includes("super_");
  const endpoint = isSubscription
    ? `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/subscriptions/${productId}/tokens/${purchaseToken}`
    : `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${packageName}/purchases/products/${productId}/tokens/${purchaseToken}`;

  const response = await fetch(endpoint, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    return { valid: false, productId, transactionId: null, expiresAt: null, error: `Google API ${response.status}` };
  }

  const data = (await response.json()) as {
    orderId?: string;
    expiryTimeMillis?: string;
    purchaseState?: number;
  };

  return {
    valid: data.purchaseState === 0,
    productId,
    transactionId: data.orderId ?? null,
    expiresAt: data.expiryTimeMillis
      ? new Date(parseInt(data.expiryTimeMillis, 10))
      : null,
  };
}

async function getGoogleAccessToken(): Promise<string> {
  const { createSign } = await import("node:crypto");
  const serviceAccount = JSON.parse(env.GOOGLE_SERVICE_ACCOUNT_KEY!) as {
    client_email: string;
    private_key: string;
  };

  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString("base64url");
  const payload = Buffer.from(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    }),
  ).toString("base64url");

  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${payload}`);
  const signature = sign.sign(serviceAccount.private_key, "base64url");

  const jwt = `${header}.${payload}.${signature}`;

  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`,
  });

  const tokenData = (await tokenResponse.json()) as { access_token: string };
  return tokenData.access_token;
}
