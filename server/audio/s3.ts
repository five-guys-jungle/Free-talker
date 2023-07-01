import { S3Client, CreateBucketCommand, ListBucketsCommand, PutObjectCommand } from "@aws-sdk/client-s3";

const client = new S3Client({ region: "ap-northeast-2" });

export const createBucket = async (bucketName: any) => {
  try {
    const { Buckets } = await client.send(new ListBucketsCommand({}));

    const bucketExists = !!Buckets?.find((bucket) => bucket.Name === bucketName);

    if (bucketExists) {
      console.log(`Bucket ${bucketName} already exists`);
      return;
    }

    const createBucketParams = {
      Bucket: bucketName,
    }

    await client.send(new CreateBucketCommand(createBucketParams));
    console.log(`Bucket "${bucketName}" created.`);

  } catch (err) {
    console.log("Bucket Create Error", err);

  }
}
