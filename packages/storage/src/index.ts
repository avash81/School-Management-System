import { S3Client } from '@aws-sdk/client-s3';
import { getRequiredEnv } from '@schoolos/config';

export function createStorageClient(source: Record<string, string | undefined> = process.env): S3Client {
  return new S3Client({
    region: 'us-east-1',
    endpoint: `http://${getRequiredEnv(source, 'MINIO_ENDPOINT')}:${getRequiredEnv(source, 'MINIO_PORT')}`,
    credentials: {
      accessKeyId: getRequiredEnv(source, 'MINIO_ACCESS_KEY'),
      secretAccessKey: getRequiredEnv(source, 'MINIO_SECRET_KEY'),
    },
    forcePathStyle: true,
  });
}
