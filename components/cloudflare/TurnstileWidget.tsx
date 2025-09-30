"use client";

import React, { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
  onSuccess: (token: string) => void;
  onExpire?: () => void;
  onError?: () => void;
  sitekey?: string;
}

const TurnstileWidget: React.FC<TurnstileWidgetProps> = ({
  onSuccess,
  onExpire,
  onError,
  sitekey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const callbackCalledRef = useRef(false); // 跟踪回调是否已被调用

  useEffect(() => {
    // 重置回调状态
    callbackCalledRef.current = false;
    
    // 确保Turnstile脚本已加载
    const loadTurnstileScript = () => {
      if (typeof window !== 'undefined' && !window.turnstile) {
        setIsLoading(true);
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?t=' + Date.now();
        script.async = true;
        script.defer = true;
        
        script.onload = () => {
          setTimeout(() => {
            renderWidget();
            setIsLoading(false);
          }, 500); // 给脚本一些时间初始化
        };
        
        script.onerror = (e: any) => {
          setIsLoading(false);
          setHasError(true);
          console.error('Turnstile 脚本加载失败', e);
        };
        
        document.body.appendChild(script);
      } else if (window.turnstile) {
        renderWidget();
        setIsLoading(false);
      }
    };

    // 渲染Turnstile小部件
    const renderWidget = () => {
      if (window.turnstile && containerRef.current) {
        try {
          if (widgetIdRef.current) {
            window.turnstile.remove(widgetIdRef.current);
          }

          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: sitekey,
            callback: (token: string) => {
              // 防止重复调用回调
              if (callbackCalledRef.current) return;
              
              console.log('Turnstile 验证成功，token:', token);
              callbackCalledRef.current = true;
              
              // 延迟执行回调，确保用户能看到验证成功
              setTimeout(() => {
                onSuccess(token);
              }, 500);
            },
            'expired-callback': () => {
              console.log('Turnstile 验证已过期');
              if (onExpire) onExpire();
            },
            'error-callback': () => {
              console.log('Turnstile 验证出错');
              setHasError(true);
              if (onError) onError();
            },
            // 添加更多选项以确保用户交互
            appearance: 'always',
            retry: 'auto',
            'refresh-expired': 'auto'
          });
        } catch (error) {
          console.error('渲染 Turnstile 小部件时出错:', error);
          setHasError(true);
        }
      }
    };

    loadTurnstileScript();

    // 清理函数
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('移除 Turnstile 小部件时出错:', error);
        }
      }
    };
  }, [onSuccess, onExpire, onError, sitekey]);

  return (
    <div className="turnstile-widget-container">
      {isLoading && (
        <div className="flex justify-center items-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-700"></div>
        </div>
      )}
      
      {hasError && (
        <div className="text-red-500 text-center p-2">
          验证加载失败，请刷新页面重试
        </div>
      )}
      
      <div ref={containerRef} className={`turnstile-container ${isLoading ? 'hidden' : ''}`}></div>
    </div>
  );
};

export default TurnstileWidget;