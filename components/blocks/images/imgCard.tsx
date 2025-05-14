'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface HairStyleCardProps {
  title: string;
  originalImage: string;
  effectImage: string;
  className?: string;
}

export function HairStyleCard({ title, originalImage, effectImage, className }: HairStyleCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isHovered) {
      setShowOriginal(true);
      timer = setTimeout(() => {
        setShowOriginal(false);
      }, 1500);
    } else {
      setShowOriginal(false);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isHovered]);

  return (
    <div 
      className={cn("relative rounded-lg overflow-hidden cursor-pointer group", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative aspect-[3/4] w-full">
        {/* 效果图层 */}
        <Image
          src={effectImage}
          alt={`${title} effect`}
          fill
          className={cn(
            "object-cover absolute inset-0 z-10 transition-all duration-1000 ease-in-out  hide-scissors",
            showOriginal ? "opacity-0 scale-105" : "opacity-100 scale-100"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* 原图图层 */}
        <Image
          src={originalImage}
          alt={`${title} original`}
          fill
          className={cn(
            "object-cover absolute inset-0 transition-all duration-1000 ease-in-out  hide-scissors",
            showOriginal ? "scale-105 opacity-100" : "scale-100 opacity-0"
          )}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>

      {/* 标题区域 */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 z-20 hide-scissors">
        <h3 className="text-white text-lg font-medium text-center">
          {title}
        </h3>
        {/* <div className="flex justify-center items-center mt-2">
          <span className="text-xs text-white/80 bg-white/20 px-3 py-1 rounded-full">
            Hover to compare
          </span>
        </div> */}
      </div>

      {/* 悬浮提示 */}
      <div className={cn(
        "absolute top-4 right-4 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full transition-all duration-300 hide-scissors",
        showOriginal ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      )}>
        <span className="text-xs text-white">
          {showOriginal ? "Original Photo" : ""}
        </span>
      </div>
    </div>
  );
}