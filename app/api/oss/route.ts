import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket') || 'ailab-tem';
    
    const stsResponse = await fetch(`https://hairstyle-app.ailabtools.com/api/system/upload/get-sts-cert?bucket=${bucket}`, {
      method: 'GET',
      headers: {
        'Accept-Language': 'zh-cn'
      }
    });
    
    const { data: stsData } = await stsResponse.json();
    console.log('sts:'+ JSON.stringify(stsData))
    
    return NextResponse.json({
      status: 200,
      data: {
        accessKeyId: stsData.Credentials.AccessKeyId,
        accessKeySecret: stsData.Credentials.AccessKeySecret,
        stsToken: stsData.Credentials.SecurityToken,
        region: 'oss-cn-shanghai',
        bucket: stsData.Bucket,
        endpoint: stsData.Endpoint
      }
    });
  } catch (error) {
    console.error('STS error:', error);
    return NextResponse.json(
      { error: '获取OSS凭证失败' },
      { status: 500 }
    );
  }
}