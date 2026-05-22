import crypto from 'crypto';

interface AWSCredentials {
  accessKeyId: string;
  secretAccessKey: string;
  sessionToken: string;
}

// AWS Signature V4 for RDS IAM auth token
export async function createRdsSignedToken(
  hostname: string,
  port: number,
  username: string,
  region: string,
  credentials: AWSCredentials
): Promise<string> {
  const service = 'rds-db';
  const method = 'GET';
  const endpoint = `${hostname}:${port}`;

  // Create canonical request
  const canonicalUri = '/';
  const canonicalQuerystring = `Action=connect&DBUser=${encodeURIComponent(username)}`;
  const canonicalHeaders = `host:${endpoint}\n`;
  const signedHeaders = 'host';

  const payloadHash = crypto.createHash('sha256').update('').digest('hex');

  const canonicalRequest = `${method}\n${canonicalUri}\n${canonicalQuerystring}\n${canonicalHeaders}\n${signedHeaders}\n${payloadHash}`;

  // Create string to sign
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, '');
  const datetimeString = date.toISOString().slice(0, 19).replace(/[-:]/g, '') + 'Z';

  const credentialScope = `${dateString}/${region}/${service}/aws4_request`;
  const algorithm = 'AWS4-HMAC-SHA256';

  const stringToSign = `${algorithm}\n${datetimeString}\n${credentialScope}\n${crypto.createHash('sha256').update(canonicalRequest).digest('hex')}`;

  // Calculate signature
  const signingKey = getSignatureKey(credentials.secretAccessKey, dateString, region, service);
  const signature = crypto.createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  // Build token
  const token = `${endpoint}/?Action=connect&DBUser=${encodeURIComponent(username)}&X-Amz-Algorithm=${algorithm}&X-Amz-Credential=${encodeURIComponent(credentials.accessKeyId)}%2F${credentialScope}&X-Amz-Date=${datetimeString}&X-Amz-Expires=900&X-Amz-SignedHeaders=${signedHeaders}&X-Amz-Security-Token=${encodeURIComponent(credentials.sessionToken)}&X-Amz-Signature=${signature}`;

  return token;
}

function getSignatureKey(key: string, dateStamp: string, regionName: string, serviceName: string) {
  const kDate = crypto.createHmac('sha256', `AWS4${key}`).update(dateStamp).digest();
  const kRegion = crypto.createHmac('sha256', kDate).update(regionName).digest();
  const kService = crypto.createHmac('sha256', kRegion).update(serviceName).digest();
  const kSigning = crypto.createHmac('sha256', kService).update('aws4_request').digest();
  return kSigning;
}