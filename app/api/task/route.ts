import { NextResponse } from 'next/server';
import { respData, respErr, respJson } from "@/lib/resp";
import { getTranslations, getLocale } from "next-intl/server";

export async function POST(request: Request) {
  const t = await getTranslations();
  const locale = await getLocale();
  try {
    const { image_url, hair_style, color,token } = await request.json();
    const taskResponse = await fetch('https://hairstyle-app.ailabtools.com/api/api/web-task/push-task', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': locale
      },
      body: JSON.stringify({
        id: 302,
        token,
        ai_params: {
          task_type: "async",
          image_url,
          hair_style,
          color,
          image_size: 4
        }
      })
    });
    
    const { code: taskCode, msg: taskMsg, data: taskData } = await taskResponse.json();
    // console.log( taskCode, taskMsg, taskData ,'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa');
    if(taskCode != 0){
      return NextResponse.json(
        { error: taskMsg },
        { status: 500 }
      );
    }
    return NextResponse.json(
      { taskId: taskData.id}
    );
  } catch (error) {
    return NextResponse.json(
      { error: error as string },
      { status: 500 }
    );
  }
}
