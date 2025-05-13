import { NextResponse } from 'next/server';
import { respData, respErr } from "@/lib/resp";
import { getTranslations, getLocale } from "next-intl/server";

export async function GET(req: Request) {
  const t = await getTranslations();
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');
    
    if (!taskId) {
      return NextResponse.json(
        { errorCode: 'task fail' },
        { status: 400 }
      );
    }

    const statusRes = await fetch(`https://hairstyle-app.ailabtools.com/api/api/web-task/get-results?id=${taskId}`, {
      method: 'GET',
      headers: {
        'Accept-Language': 'zh-cn'
      }
    });
    const { data: res } = await statusRes.json();
    console.log('data:'+JSON.stringify(res))
    switch (res.status) {
      case -1: { // 处理失败
        const errorCode = res?.data?.data?.error_detail?.code
        
        let message = ''
        if (errorCode) {
          // TODO 多语言错误文本
          message += t("aiError."+errorCode);
        } else {
          message += t('aiError.PROCESSING_FAILURE');
        }
  
        // TODO 显示错误
        console.log(message)
        return NextResponse.json(
          { error: message },
          { status: 500 , statusText: message}
        );
        break
      }
      case 1:  // TODO 1:处理成功
        return NextResponse.json({
          status: res.status,
          result: res.data.data.images
        });
        break
      default:  // TODO 0:待处理
        return NextResponse.json({
          status: res.status
        });
        break
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'error' },
      { status: 500 }
    );
  }
}

