// mail.service.ts
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AwsService {

  private s3Client: S3Client;

  constructor() {
    this.s3Client = new S3Client({
        region: 'ap-south-1', // Use the correct region code
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.SECRET_ACCESS_KEY,
        },
    });
  }

  async uploadClientFile(files: any): Promise<string>{
    const fileName = `${Date.now()}_${files[0].originalname}`;
    const s3Params = {
      Bucket: 'tirgo-bucket',
      Key: `client/${fileName}`,
      Body: files[0].buffer,
    };
    // Perform the PutObject operation
    const command = new PutObjectCommand(s3Params);
    const res = await this.s3Client.send(command);
    if(res['$metadata'].httpStatusCode) {
        return fileName
    } else {
        return ''
    }
  }

  async deleteFile(keyName: string, fileName: string): Promise<boolean> {
    const s3Params = {
      Bucket: 'tirgo-bucket',
      Key: `${keyName}/${fileName}`,
  };

  try {
      const command = new DeleteObjectCommand(s3Params);
      console.log('delete', `${keyName}/${fileName}`);
      const res = await this.s3Client.send(command);
      console.log('delete successful');
      return true;
  } catch (error) {
      console.error('delete failed', error);
      return false;
  }
  }
}
