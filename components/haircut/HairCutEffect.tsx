'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export function HairCutEffect() {
  const [isCutting, setIsCutting] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const strandsRef = useRef<HTMLDivElement[]>([]);
  const maxStrands = 40;
  const activeStrands = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const scissorsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const createHairStrand = (x: number, y: number) => {
      if (!scissorsRef.current || activeStrands.current >= maxStrands) return;

      const strand = document.createElement('div');
      strand.className = 'hair-strand';
      activeStrands.current++;

      // 发丝随机参数
      const length = 60 + Math.random() * 60;
      const baseAngle = Math.random() * 50 - 25;
      const driftRange = 100;
      const duration = 1.5 + Math.random();
      
      // 随机发丝颜色
      const colors = ['#FFC300'];
      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      // 让发丝从剪刀位置掉落，考虑页面滚动位置
      const scissorsRect = scissorsRef.current!.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      Object.assign(strand.style, {
        left: `${scissorsRect.left + scissorsRect.width / 2}px`,
        top: `${scissorsRect.top + scissorsRect.height / 2 + scrollTop}px`,
        height: `${length}px`,
        transform: `rotate(${baseAngle}deg)`,
        opacity: '0.85',
        backgroundColor: randomColor,
      });

      document.body.appendChild(strand);
      strandsRef.current.push(strand);

      // 执行动画
      requestAnimationFrame(() => {
        strand.style.transition = `all ${duration}s ease-out`;
        strand.style.transform = `
          translate(${(Math.random() - 0.5) * driftRange}px, 
          ${150 + Math.random() * 50}px)
          rotate(${baseAngle + 50 + (Math.random() * 30 - 15)}deg)`;
        strand.style.opacity = '0';
      });

      // 动画结束后删除发丝
      setTimeout(() => {
        strand.remove();
        activeStrands.current--;
        strandsRef.current = strandsRef.current.filter(s => s !== strand);
      }, duration * 1000);
    };

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });

      // 获取鼠标下的元素，添加空值检查
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target) {
        setIsCutting(false);
        scissorsRef.current!.style.display = 'none';
        return;
      }

      // 如果鼠标下的元素是按钮、a标签或其他特定元素，则隐藏剪刀
      if (
        target.tagName === 'BUTTON' ||
        target.tagName === 'A' ||
        (target as HTMLElement).classList.contains('hide-scissors')
      ) {
        setIsCutting(false);
        scissorsRef.current!.style.display = 'none';
      } else {
        // 只有鼠标在页面区域内时才触发剪发效果
        if (!document.querySelector('button:hover')) {
          setIsCutting(true);
          scissorsRef.current!.style.display = 'block';
          createHairStrand(e.clientX, e.clientY);
        }
      }

      // 鼠标移动时清除静止计时器
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // 1500ms 后鼠标静止则恢复静态剪刀
      timeoutRef.current = setTimeout(() => {
        setIsCutting(false);
      }, 1500);
    };

    const handleMouseDown = (e: MouseEvent) => {
      // 添加空值检查
      if (!e.target) {
        setIsCutting(false);
        scissorsRef.current!.style.display = 'none';
        return;
      }

      // 如果点击的是按钮或其他特定元素，则隐藏剪刀
      if (
        (e.target as HTMLElement).tagName === 'BUTTON' ||
        (e.target as HTMLElement).classList.contains('hide-scissors') ||
        (e.target as HTMLElement).tagName === 'A'
      ) {
        setIsCutting(false);
        scissorsRef.current!.style.display = 'none';
      } else {
        setIsCutting(true);
        scissorsRef.current!.style.display = 'block';
      }
    };

    const handleMouseStop = () => {
      // 鼠标静止时变回静态剪刀
      setIsCutting(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousestop', handleMouseStop);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousestop', handleMouseStop);
      strandsRef.current.forEach(strand => strand.remove());
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      <div
        ref={scissorsRef}
        className={`absolute w-16 h-16 transform -translate-x-1/2 -translate-y-1/2 ${isCutting ? 'cutting-animation' : ''}`}
        style={{
          left: position.x,
          top: position.y
        }}
      >
        <Image
          src={isCutting ? "/imgs/scissors.gif" : "/imgs/scissors.png"}
          alt="Scissors"
          width={64}
          height={64}
          key={isCutting ? "scissors-gif" : "scissors-png"}
          style={{
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </div>
  );
}
