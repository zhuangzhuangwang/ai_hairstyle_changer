import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bucket = searchParams.get('bucket') || 'ailab-inputs';
    
    const stsResponse = await fetch(`https://hairstyle-app.ailabtools.com/api/system/upload/get-sts-cert?bucket=${bucket}&_t=${Date.now()}`, {
      method: 'GET',
      headers: {
        'Accept-Language': 'zh-cn'
      }
    });
    
    const { data: stsData } = await stsResponse.json();
    
    return NextResponse.json({
      status: 200,
      data: {
        accessKeyId: stsData.Credentials.AccessKeyId,
        accessKeySecret: stsData.Credentials.AccessKeySecret,
        stsToken: stsData.Credentials.SecurityToken,
        region: 'oss-cn-shanghai',
        bucket: stsData.Bucket,
        endpoint: stsData.AccelerateDomain
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
