import { NextResponse } from 'next/server';
import { respData, respErr, respJson } from "@/lib/resp";
import { getTranslations, getLocale } from "next-intl/server";

export async function POST(request: Request) {
  const t = await getTranslations();
  const locale = await getLocale();
  try {
    const { image_url,token } = await request.json();
    const taskResponse = await fetch('https://hairstyle-app.ailabtools.com/api/api/web-task/push-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale
      },
      body: JSON.stringify({
        id: 275,
        token,
        ai_params: {
          task_type: "async",
          image_url
        }
      })
    });
    
    const { code: taskCode, msg: taskMsg, data: taskData } = await taskResponse.json();
    
    if(taskCode != 0){
      return NextResponse.json(
        { error: taskMsg },
        { status: 500 ,statusText: taskMsg}
      );
    }
    return NextResponse.json(
      { taskId: taskData.id}
    );
  } catch (error) {
    return NextResponse.json(
      { status: 500 ,statusText: 'Create task error:' + error}
    );
  }
}
