// components/HairStyleSelector.tsx
"use client";

import React, { useState, useEffect } from 'react';
import TurnstileWidget from '@/components/cloudflare/TurnstileWidget';

type Gender = 'female' | 'male';
type HairStyle = {
    value: string;
    title: string;
    img: string;
};

export default function HairStyleSelectors({ editor }: { editor: any }) {
    if (!editor) {
        return null;
    }

    const [gender, setGender] = useState<Gender>('female');
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showLeftPanel, setShowLeftPanel] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [showTurnstile, setShowTurnstile] = useState(false);
    const [turnstileVerified, setTurnstileVerified] = useState(false);
    const [token, setToken] = useState<string>(''); // 新增token状态存储验证令牌
    //  发型样式数据
    const hairData = editor.left_box.hair_styles
    // 检测屏幕宽度
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // 获取选中的发型数据
    const selectedHairStyle = hairData && hairData[gender === 'female' ? 'women' : 'men']?.find(
        (style: HairStyle) => style.value === selectedStyle
    );

    const handleFileUpload = (file: File) => {
        // 验证文件类型
        const allowedTypes = ['image/jpeg', 'image/png', 'image/bmp', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            alert('不支持的文件类型');
            return;
        }

        // 验证文件大小（最大5MB）
        if (file.size > 1 * 1024 * 1024) {
            alert('文件大小不能超过5MB');
            return;
        }

        // 处理上传逻辑
        const reader = new FileReader();
        reader.onload = (e) => {
            setUploadedImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        if (isMobile) {
            setShowLeftPanel(true);
            setShowRightPanel(false);
        }
    };

    // 处理示例图片点击
    const handleSampleClick = (src: string) => {
        setUploadedImage(src);
        if (isMobile) {
            setShowLeftPanel(true);
            setShowRightPanel(false);
        }
    };

    // 计算是否所有条件都满足
    const isGenerateDisabled = !selectedStyle || !selectedColor || !uploadedImage;

    // 处理Generate按钮点击
  const handleGenerate = async () => {
    try {
      // 先执行原有验证流程
      if (isMobile) {
        setShowRightPanel(true);
        setShowLeftPanel(false);
      }
      setShowTurnstile(true);
      
      // 等待Turnstile验证完成
      // 验证Turnstile令牌
    //   const turnstileToken = await new Promise<string>((resolve, reject) => {
    //     const checkVerification = () => {
    //       if (turnstileVerified && token) {
    //         resolve(token);
    //       } else if (!showTurnstile) {
    //         reject(new Error('用户取消验证'));
    //       } else {
    //         setTimeout(checkVerification, 100);
    //       }
    //     };
    //     checkVerification();
    //   });

      // 验证后端令牌
    //   const verifyRes = await fetch('/api/verify-turnstile', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ token: turnstileToken })
    //   });
    //   if (!verifyRes.ok) throw new Error('Cloudflare验证失败');
      const turnstileToken = '1111'
      if (!uploadedImage) throw new Error('请先上传图片');
      
      // 1. 获取OSS上传凭证（添加bucket参数）
      const stsRes = await fetch(`/api/oss?bucket=ailab-tem&token=${turnstileToken}`);
      if (!stsRes.ok) throw new Error('获取OSS凭证失败');
      const { data: ossConfig } = await stsRes.json();
      
      // 2. 初始化OSS客户端
      const OSS = require('ali-oss');
      const ossClient = new OSS({
        region: ossConfig.region,
        accessKeyId: ossConfig.accessKeyId,
        accessKeySecret: ossConfig.accessKeySecret,
        stsToken: ossConfig.stsToken,
        bucket: ossConfig.bucket,
        endpoint: ossConfig.endpoint
      });
      
      // 3. 转换并上传图片到OSS
      const blob = await fetch(uploadedImage).then(r => r.blob());
      const file = new File([blob], "haircut.jpg", { type: blob.type });
      
      const uploadResult = await ossClient.put(
        `haircut/${Date.now()}.jpg`, 
        file
      );
      
      // 4. 创建处理任务
      const taskRes = await fetch('/api/task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image_url: uploadResult.url,
          hair_style: selectedStyle,
          color: selectedColor
        })
      });
      if (!taskRes.ok) throw new Error('创建任务失败');
      const { taskId } = await taskRes.json();
      
      // 5. 轮询任务结果（120次*2秒=4分钟）
      const startTime = Date.now();
      const checkResult = async (attempt = 0): Promise<any> => {
        if (attempt >= 120) throw new Error('处理超时');
        
        const resultRes = await fetch(`/api/task/poll?id=${taskId}`);
        if (!resultRes.ok) throw new Error('获取任务状态失败');
        
        const { status, result } = await resultRes.json();
        
        if (status === 1) return result;
        if (status === -1) throw new Error('处理失败');
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        return checkResult(attempt + 1);
      };
      
      return await checkResult();
    } catch (error: unknown) {
      console.error('处理失败:', error);
      let errorMessage = '未知错误';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      alert(errorMessage);
      throw error;
    }
  };

    // 处理Turnstile验证成功
    const handleTurnstileSuccess = (token: string) => {
        if (!token) {
            console.error('验证失败：没有收到有效的验证令牌');
            return;
        }
        
        console.log('验证成功，令牌:', token);
        
        // 设置验证状态
        setTurnstileVerified(true);
        
        // 关闭验证弹窗
        setShowTurnstile(false);
        
        // 在这里添加生成发型的逻辑
        console.log('开始生成发型', {
            style: selectedStyle,
            color: selectedColor,
            image: uploadedImage
        });
        
        // TODO: 调用生成发型的API
    };

    return (
        <section id={editor.name} className="py-6">
            {/* Turnstile验证弹窗 */}
            {showTurnstile && (
                <div 
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    onClick={(e) => {
                        // 阻止事件冒泡，防止点击背景关闭弹窗
                        e.stopPropagation();
                    }}
                >
                    <div 
                        className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full darkAmber"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-lg font-medium text-left flex-1">
                                {editor.turnstile?.title || 'Please Verify'}
                            </h3>
                            <button 
                                className="text-gray-500 hover:text-gray-700"
                                onClick={() => setShowTurnstile(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex justify-center mb-2">
                            <TurnstileWidget 
                                onSuccess={handleTurnstileSuccess}
                                onError={() => console.error('Turnstile 验证出错')}
                                onExpire={() => console.log('Turnstile 验证已过期')}
                            />
                        </div>
                    </div>
                </div>
            )}
            
            <div className="flex flex-col md:flex-row container mx-auto gap-8 p-4 md:p-8 rounded-lg mt-6 dementor shadow-lg shadow-gray-500/50">
                {/* 左侧发型选择区域 */}
                {(!isMobile || showLeftPanel) && (
                    <div className={`w-full md:w-[30%] flex flex-col h-[700px] ${isMobile ? 'order-2' : ''}`}>
                        {/* 性别切换 */}
                        <div className="flex mb-4 bg-gray-100 p-1 rounded-lg">
                            <button 
                                className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                                    gender === 'female' ? 'bg-amber-700/60 text-white' : 'text-gray-500'
                                }`}
                                onClick={() => setGender('female')}
                            >
                                {editor.left_box.women_btn}
                            </button>
                            <button 
                                className={`flex-1 px-4 py-2 rounded-lg text-sm ${
                                    gender === 'male' ? 'bg-amber-700/60 text-white' : 'text-gray-500'
                                }`}
                                onClick={() => setGender('male')}
                            >
                                {editor.left_box.men_btn}
                            </button>
                        </div>

                        {/* 发型列表 */}
                        <div className="flex-1 p-2 overflow-y-auto scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-gray-100 hover:scrollbar-thumb-amber-400 scrollbar-thumb-rounded-full">
                            <div className="grid grid-cols-3 gap-2 pr-2">
                                {hairData && hairData[gender === 'female' ? 'women' : 'men']?.map((style: HairStyle, index: number) => {
                                    const isSelected = selectedStyle === style.value;
                                    const rowStart = Math.floor(index / 3) * 4 + 1; // 每4行一组（3发型+1颜色选择器）
                                    const rowEnd = rowStart + 1;

                                    return (
                                        <React.Fragment key={style.value}>
                                            {/* 发型项 */}
                                            <div
                                                className={`bg-gray-100 rounded-lg cursor-pointer ${
                                                    isSelected ? 'ring-2 ring-amber-600' : ''
                                                }`}
                                                style={{
                                                    gridRowStart: rowStart,
                                                    gridRowEnd: rowEnd
                                                }}
                                                onClick={() => setSelectedStyle(style.value)}
                                            >
                                                <div className="relative w-full h-full">
                                                    <div className="relative w-full pb-[160%]">
                                                        <img 
                                                            src={style.img} 
                                                            alt={style.title} 
                                                            className="absolute inset-0 w-full h-full object-fill rounded-lg hide-scissors"
                                                        />
                                                    </div>
                                                    <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1 rounded-b-lg">
                                                        <p className="text-sm text-white text-center hide-scissors truncate">
                                                            {style.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 颜色选择器 */}
                                            {isSelected && (
                                                <div
                                                    className="col-span-3 mt-2 bg-white p-4 rounded-lg shadow-lg"
                                                    style={{
                                                        gridRowStart: rowStart + 1,
                                                        gridRowEnd: rowStart + 2
                                                    }}
                                                >
                                                    <div className="grid grid-cols-6 gap-2">
                                                        {hairData && hairData.colors?.map((color: any) => (
                                                            <div
                                                                key={color.value}
                                                                className={`p-1 rounded cursor-pointer ${
                                                                    selectedColor === color.value ? 'ring-2 ring-amber-600' : ''
                                                                }`}
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setSelectedColor(color.value);
                                                                }}
                                                            >
                                                                <img
                                                                    src={color.img}
                                                                    alt={color.title}
                                                                    className="w-full h-auto rounded hide-scissors"
                                                                />
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </React.Fragment>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Generate 按钮 */}
                        <button 
                            className={`mt-4 w-full py-3 rounded-lg transition-colors ${
                                isGenerateDisabled 
                                    ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
                                    : 'bg-amber-700/60 text-white hover:bg-amber-700'
                            }`}
                            disabled={isGenerateDisabled}
                            onClick={handleGenerate}
                        >
                            {editor.left_box.generate_btn}
                        </button>
                    </div>
                )}

                {/* 右侧上传区域 */}
                {(!isMobile || showRightPanel) && (
                    <div className={`w-full md:w-[70%] ${isMobile ? 'order-1' : ''}`}>
                        <div 
                            className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center min-h-[600px] relative"
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.add('border-amber-500');
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-amber-500');
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('border-amber-500');
                                const files = e.dataTransfer.files;
                                if (files && files[0]) {
                                    handleFileUpload(files[0]);
                                }
                            }}
                        >
                            {uploadedImage ? (
                                <>
                                    <img 
                                        src={uploadedImage} 
                                        alt="Uploaded preview" 
                                        className="absolute inset-0 w-full h-full object-contain p-4"
                                    />
                                    <button
                                        className="absolute top-2 right-2 bg-white/80 p-1 rounded-full hover:bg-white transition-colors hide-scissors"
                                        onClick={() => setUploadedImage(null)}
                                    >
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-amber-700/60 mb-4">
                                        <svg className="w-12 h-12" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                        </svg>
                                    </div>
                                    <p className="text-center mb-4 ">{editor.right_box.upload_text}</p>
                                    <input 
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        accept=".jpg,.jpeg,.png,.bmp,.webp"
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleFileUpload(e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <label 
                                        htmlFor="fileInput"
                                        className="bg-amber-700/60 text-white px-6 py-2 rounded-lg cursor-pointer hide-scissors"
                                    >
                                        {editor.right_box.upload_btn}
                                    </label>
                                    <p className="text-gray-400 text-sm mt-4">
                                        {editor.right_box.upload_rules}
                                    </p>
                                </>
                            )}
                        </div>
                        <div className="mt-4 text-center text-gray-500">
                            <p>{editor.right_box.upload_example}</p>
                            <div className="flex gap-2 mt-2 justify-center">
                                {[
                                    "https://ai-resource.ailabtools.com/resource/361-before.png",
                                    "https://ai-resource.ailabtools.com/resource/360-before.png",
                                    "https://ai-resource.ailabtools.com/resource/359-before.png",
                                    "https://ai-resource.ailabtools.com/resource/358-before.png"
                                ].map((src, index) => (
                                    <img 
                                        key={index}
                                        src={src} 
                                        alt={`Sample ${index + 1}`} 
                                        className="w-12 h-12 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-amber-600 transition-all hide-scissors"
                                        onClick={() => handleSampleClick(src)}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
