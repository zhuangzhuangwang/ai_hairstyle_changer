// components/HairStyleSelector.tsx
"use client";

import React, { useState, useEffect } from 'react';
import TurnstileWidget from '@/components/cloudflare/TurnstileWidget';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alertdialog"
import { Progress } from "@/components/ui/progress"  
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import HairHistory from './HairHistory';


type Gender = 'female' | 'male';
type HairStyle = {
    value: string;
    title: string;
    img: string;
};


export default function HairStyleSelector({ editor }: { editor: any }) {
    const t = useTranslations(); // 多语言errormsg
    if (!editor) {
        return null;
    }

    const [gender, setGender] = useState<Gender>('female');
    const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
    const [selectedColor, setSelectedColor] = useState<string | null>(null);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [resultImage, setResultImage] = useState<string[] | null>(null);
    const [previewImage, setPreviewImage] = useState<string | undefined>(undefined);
    const [showFullscreenPreview, setShowFullscreenPreview] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);
    const [isPolling, setIsPolling] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [showLeftPanel, setShowLeftPanel] = useState(false);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [showTurnstile, setShowTurnstile] = useState(false);
    const [isload, setIsload] = useState(false);
    const [loadNum, setLoadNum] = useState(0);
    const [latestResult, setLatestResult] = useState<{ originalImageSrc: string; resultImageSrcs: string[] } | undefined>(undefined); // 新增状态
    const targetRatio = 0.15
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

    const handleFileUpload = async (file: File) => {
        
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            return toast.error('type error!!!');
        }
        setIsload(true)
        setLoadNum(30)
        // 验证文件大小（最大5MB）
        const maxSize = 5 * 1024 * 1024;
        
        if (file.size > maxSize) {
            // 如果超过大小限制，尝试压缩而不是直接拒绝
            try {
                const compressedFile = await compressImage(file, maxSize);
                if (!compressedFile) {
                    setIsload(false)
                    return toast.error(t("editorError.Failed"));
                }
                file = compressedFile;
            } catch (error) {
                setIsload(false)
                return toast.error(t("editorError.Failed"));
            }
        }
    
        // 检查并调整分辨率
        try {
            const processedImage = await processImageResolution(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                setLoadNum(100)
                setIsload(false)
                setUploadedImage(e.target?.result as string);
            };
            reader.readAsDataURL(processedImage);
        } catch (error) {
            setIsload(false)
            return toast.error(t("editorError.Failed"));
        }
    
        if (isMobile) {
            setShowLeftPanel(true);
            setShowRightPanel(false);
        }
    };
    
    // 图片压缩函数
    const compressImage = async (file: File, maxSize: number): Promise<File | null> => {
        setLoadNum(60)
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 保持原始宽高比
                let width = img.width;
                let height = img.height;
                
                // 设置画布大小
                canvas.width = width;
                canvas.height = height;
                
                // 绘制图像
                ctx?.drawImage(img, 0, 0, width, height);
                
                // 质量参数
                let quality = 0.9;
                let compressedBlob: Blob | null = null;
                
                // 尝试压缩循环
                const attemptCompression = () => {
                    canvas.toBlob((blob) => {
                        if (!blob) {
                            resolve(null);
                            return;
                        }
                        
                        if (blob.size <= maxSize || quality <= 0.1) {
                            compressedBlob = blob;
                            resolve(new File([blob], file.name, { type: file.type }));
                        } else {
                            quality -= 0.1;
                            attemptCompression();
                        }
                    }, file.type, quality);
                };
                
                attemptCompression();
            };
            
            img.onerror = () => {
                setIsload(false)
                resolve(null);
            };
        });
    };
    
    // 处理图片分辨率
    const processImageResolution = async (file: File): Promise<File> => {
        setLoadNum(80)
        return new Promise((resolve) => {
            const img = new Image();
            img.src = URL.createObjectURL(file);
            img.onload = () => {
                const maxDimension = 2000; // 最大尺寸
                const minDimension = 200;  // 最小尺寸
                
                let width = img.width;
                let height = img.height;
                
                // 检查是否需要调整大小
                if (width > maxDimension || height > maxDimension) {
                    const scale = Math.min(maxDimension / width, maxDimension / height);
                    width = Math.floor(width * scale);
                    height = Math.floor(height * scale);
                } else if (width < minDimension || height < minDimension) {
                    // 如果图片太小，可以选择拒绝或保持原样
                    // 这里选择保持原样但显示警告
                    return toast.warning('Images are low resolution');
                }
                
                // 如果尺寸需要调整
                if (width !== img.width || height !== img.height) {
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    canvas.toBlob((blob) => {
                        if (blob) {
                            resolve(new File([blob], file.name, { type: file.type }));
                        } else {
                            resolve(file); // 如果调整失败，返回原始文件
                        }
                    }, file.type);
                } else {
                    resolve(file); // 不需要调整，返回原始文件
                }
            };
            
            img.onerror = () => {
                resolve(file); // 如果加载失败，返回原始文件
            };
        });
    };
  
    // 处理示例图片点击
    const handleSampleClick = (src: string) => {
        setUploadedImage(src);
        setImageUrl(src)
        if (isMobile) {
            setShowLeftPanel(true);
            setShowRightPanel(false);
        }
    };

    // 处理历史记录的重试
    const handleHistoryRetry = (originalImage: string) => {
        setUploadedImage(originalImage);
        setResultImage(null);
        setImageUrl(originalImage);
        setShowOriginal(true);
        // 重置样式和颜色选择，如果需要的话。目前保持不变。
    };

    // 计算是否所有条件都满足
    const isGenerateDisabled = !selectedStyle || !selectedColor || !uploadedImage || isPolling;

    // 处理Generate按钮点击
    const handleGenerate = async () => {
        try {
        // 先执行原有验证流程
        if (isMobile) {
            setShowRightPanel(true);
            setShowLeftPanel(false);
        }
        // 开始处理时关闭验证弹窗
        setShowTurnstile(true);
        
        } catch (error: unknown) {
        let errorMessage = 'error';
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }
        toast.error(errorMessage);
        throw error;
        }
    };

  const handleTurnstileSuccess = async (turnstileToken:any) => {
        // 关闭弹窗
        setShowTurnstile(false)
        // 在这里添加生成发型的逻辑
        try{
            // TODO: 调用生成发型的API
            // 1. 获取OSS上传凭证（添加bucket参数）
            if (!uploadedImage) throw new Error(t("editorError.Failed"));
            // 显示扫描动效（首次轮询时触发）
            setIsPolling(true);
            if (!imageUrl) {
                const stsRes = await fetch(`/api/oss?bucket=ailab-tem`);
                if (!stsRes.ok) throw new Error(t("editorError.Failed"));
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
                // 检测人脸占比信息
                startCheckFaceTask(file,uploadResult.url,turnstileToken)
            }else{
                startAiTask(imageUrl,turnstileToken)
            }
        } catch (error: unknown) {
            // 停止扫描
            setIsPolling(false);
            console.error('处理失败:', error);
            let errorMessage = t("editorError.Task_Fail");
            if (error instanceof Error) {
              errorMessage = error.message;
            } else if (typeof error === 'string') {
              errorMessage = error;
            }
            toast.error(errorMessage);
            throw error;
        }
    };
    const startCheckFaceTask = async (file: File, imgUrl: any, turnstileToken: any) => {
        try{  
            // 4. 创建处理任务
            const taskRes = await fetch('/api/task/check', {
                method: 'POST',
                body: JSON.stringify({
                    image_url: imgUrl,
                    token: turnstileToken
                })
            });
            console.log(taskRes,'ssssssssssssssssssssssssss')
            if (!taskRes.ok) {
               setIsPolling(false)
               return toast.error(taskRes.statusText);
            }
            
            const { taskId } = await taskRes.json();
            // 5. 轮询任务结果（60次*2秒=2分钟）
            const startTime = Date.now();
            const checkResult = async (attempt = 0): Promise<any> => {
                if (attempt >= 60) {
                    setIsPolling(false)
                    throw new Error(t("editorError.Time_Out"))
                };
                const resultRes = await fetch(`/api/task/check/poll?id=${taskId}`);
                if (!resultRes.ok) {
                    setIsPolling(false)
                    return toast.error(resultRes.statusText);
                }
                const { status, result } = await resultRes.json();
                
                if (status === 1) {
                    const img = new Image();
                    img.src = URL.createObjectURL(file);
                    console.log(result)
                    const hasFace = result.hasFace;
                    const faceNum = result.faces;
                    
                    if (!hasFace || result.bbox.length === 0) {
                        setIsPolling(false);
                        return toast.error(t("editorError.No_Face"));
                    }
                    if (faceNum > 1) {
                        setIsPolling(false);
                        return toast.error(t("editorError.Multiple_Faces"));
                    }
                    if (!result.poseAnalyse) {
                        setIsPolling(false);
                        return toast.error(t("editorError.Large_Face_Offset"));
                    }
                    if (result.faceRatio < 0.15) {
                        // 裁剪图片
                        const imageBlob = await cropImage(file, result);
                        const url = URL.createObjectURL(imageBlob as Blob);
                        setUploadedImage(url as string)

                        const stsRes = await fetch(`/api/oss?bucket=ailab-tem`);
                        if (!stsRes.ok) throw new Error('upload fail!!!');
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
                        const uploadResult = await ossClient.put(
                            `haircut/${Date.now()}.jpg`, 
                            imageBlob
                        );
                        imgUrl = uploadResult.url
                    }
                    startAiTask(imgUrl,turnstileToken)
                    return;
                }
                if (status === -1) {
                    setIsPolling(false);
                    throw new Error('fail');
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkResult(attempt + 1);
            };
            
            return await checkResult();
        } catch (error: unknown) {
            // 停止扫描
            setIsPolling(false);
            let errorMessage = 'error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            toast.error(errorMessage);
            throw error;
        }
    };
    const cropImage = async (imageData:any, faceData:any) => {
        const img = new Image();
        img.src = URL.createObjectURL(imageData);

        return new Promise((resolve) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                const imageWidth = img.width;
                const imageHeight = img.height;
    
                const [x1, y1, x2, y2] = faceData.bbox;
                const faceWidth = x2 - x1;
                const faceHeight = y2 - y1;
                const faceArea = faceWidth * faceHeight;
                const imageArea = imageWidth * imageHeight;

                // 计算目标裁剪区域的面积（faceArea / targetRatio）
                const targetArea = faceArea / targetRatio;

                // 保持原图宽高比
                const aspectRatio = imageWidth / imageHeight;
                let cropWidth = Math.sqrt(targetArea * aspectRatio);
                let cropHeight = cropWidth / aspectRatio;

                // 确保不超过原图尺寸
                cropWidth = Math.min(cropWidth, imageWidth);
                cropHeight = Math.min(cropHeight, imageHeight);

                // 计算人脸中心点
                const faceCenterX = (x1 + x2) / 2;
                const faceCenterY = (y1 + y2) / 2;

                // 以人脸为中心计算裁剪区域
                let cropX = faceCenterX - cropWidth / 2;
                let cropY = faceCenterY - cropHeight / 2;

                // 调整边界，防止超出图片范围
                if (cropX < 0) cropX = 0;
                if (cropY < 0) cropY = 0;
                if (cropX + cropWidth > imageWidth) cropX = imageWidth - cropWidth;
                if (cropY + cropHeight > imageHeight) cropY = imageHeight - cropHeight;

               
                // console.log("Crop dimensions:", {
                //     cropWidth,
                //     cropHeight,
                //     cropX,
                //     cropY,
                //     faceWidth,
                //     faceHeight,
                //     imgWidth: img.width,
                //     imgHeight: img.height
                // });

                // Set canvas dimensions
                canvas.width = cropWidth;
                canvas.height = cropHeight;

                // Draw the image
                try {
                    ctx?.drawImage(img, cropX, cropY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
                    const blob = new Promise<Blob>((resolve) => {
                        canvas.toBlob(
                            (blob) => resolve(blob!), // 注意：blob 可能为 null
                            'image/jpeg',
                            0.95
                        );
                    });
                    // const result = canvas.toDataURL('image/jpeg', 0.95);
                    console.log("Cropping completed successfully");
                    resolve(blob);
                } catch (error) {
                    console.error("Error during cropping:", error);
                    // If cropping fails, return original image
                    resolve(imageData);
                }
            };
        });
    }

    const startAiTask = async (imgUrl: any, turnstileToken: any) => {
        try{  
            // 4. 创建处理任务
            const taskRes = await fetch('/api/task', {
                method: 'POST',
                body: JSON.stringify({
                    image_url: imgUrl,
                    hair_style: selectedStyle,
                    color: selectedColor,
                    token: turnstileToken
                })
            });
            console.log(taskRes,'ssssssssssssssssssssssssss')
            if (!taskRes.ok) {
               setIsPolling(false)
               return toast.error(taskRes.statusText);
            }
            
            const { taskId } = await taskRes.json();
            // 5. 轮询任务结果（60次*2秒=2分钟）
            const startTime = Date.now();
            const checkResult = async (attempt = 0): Promise<any> => {
                if (attempt >= 60) {
                    setIsPolling(false)
                    throw new Error('Time Out!!!')
                };
                const resultRes = await fetch(`/api/task/poll?id=${taskId}`);
                if (!resultRes.ok) {
                    setIsPolling(false)
                    return toast.error(resultRes.statusText);
                }
                const { status, result } = await resultRes.json();
                
                if (status === 1) {
                    // 显示结果图片并停止扫描
                    setResultImage(result);
                    setIsPolling(false);
                    // 隐藏底部示例图片
                    setShowOriginal(false);

                    // 将最新结果保存到 latestResult 状态
                    if (imgUrl) {
                        setLatestResult({
                            originalImageSrc: imgUrl,
                            resultImageSrcs: result,
                        });
                    }

                    return result;
                }
                if (status === -1) {
                    setIsPolling(false);
                    throw new Error('fail');
                }
                await new Promise(resolve => setTimeout(resolve, 2000));
                return checkResult(attempt + 1);
            };
            
            return await checkResult();
        } catch (error: unknown) {
            // 停止扫描
            setIsPolling(false);
            let errorMessage = 'error';
            if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'string') {
                errorMessage = error;
            }
            toast.error(errorMessage);
            throw error;
        }
    };
    return (
        <>
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
                            </div>
                            <div className="flex justify-center mb-2">
                                <TurnstileWidget 
                                    onSuccess={ async (e) => {
                                        // 开始处理
                                        handleTurnstileSuccess(e)
                                    }}
                                    onError={() => console.error('Turnstile Fail!!!')}
                                    onExpire={() => console.log('Turnstile Time Out!!!')}
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
                            {resultImage ? (
                                <button
                                    className='mt-4 w-full py-3 rounded-lg transition-colors  bg-amber-700/60 text-white hover:bg-amber-700'
                                    onClick={() => {
                                        if (latestResult && latestResult.originalImageSrc) {
                                            setUploadedImage(latestResult.originalImageSrc);
                                            setImageUrl(latestResult.originalImageSrc);
                                        }
                                        setResultImage(null);
                                        setShowOriginal(true);
                                    }}
                                >
                                    {editor.generate_model.title}
                                </button>
                            ) : 
                            <>
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
                            </>
                           }
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
                                        setImageUrl(null);
                                        handleFileUpload(files[0]);
                                    }
                                }}
                            >
                                {resultImage ? (
                                 <div className="grid grid-cols-2 gap-1 w-full h-full">
                                    {
                                        isMobile && <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <button className= 'absolute right-0 left-0 top-0 w-full bg-amber-700/60 text-white p-2 ' >
                                                {editor.generate_model.title}
                                                </button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>{editor.generate_model.sub_text}</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                {editor.generate_model.content}
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>{editor.generate_model.cencel}</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => {
                                                    setResultImage(null);
                                                    setUploadedImage(null);
                                                    setImageUrl(null);
                                                    setShowOriginal(true); // 重置后显示底部示例图片
                                                }}>{editor.generate_model.confirm}</AlertDialogAction>
                                            </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    }
                                    {resultImage.map((imgUrl: string, index: number) => (
                                      <div key={index} className="relative aspect-square group">
                                        <img
                                          src={imgUrl}
                                          alt={`hairStyle- ${index + 1}`}
                                          className="w-full h-full object-cover object-top rounded-lg cursor-zoom-in transition-transform hover:scale-105"
                                          onClick={() => {
                                            setPreviewImage(imgUrl);
                                            setShowFullscreenPreview(true);
                                          }}
                                        />
                                        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                          <button
                                            className="bg-amber-700/60 text-white px-3 py-1 rounded-lg hover:bg-amber-700"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const link = document.createElement('a');
                                              link.href = imgUrl;
                                              link.download = `result-${index}-${Date.now()}.jpg`;
                                              document.body.appendChild(link);
                                              link.click();
                                              document.body.removeChild(link);
                                            }}
                                          >
                                            {editor.right_box.download_btn}
                                          </button>
                                        </div>
                                      </div>
                                    ))}
                                    
                                  </div>
                                ) : uploadedImage ? (
                                    <>
                                        {isPolling && <div className="scan-animation"></div>}
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
                                ) : isload ? (
                                    <Progress className='w-full' value={loadNum} />
                                ) 
                                : (
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
                                            accept=".jpg,.jpeg,.png"
                                            onChange={(e) => {
                                                if (e.target.files && e.target.files[0]) {
                                                    setImageUrl(null);
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
                                        <div className='flex flex-col items-center justify-center'>
                                            {editor.right_box.upload_rules?.map((upload_rule: any , index: number) => (
                                                <p key={index} className="text-gray-400 text-sm mt-4">
                                                    {upload_rule}
                                                </p>
                                            ))}
                                        </div>
                                        
                                    </>
                                )}
                            </div>
                            {showFullscreenPreview && (
                                <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                                    <div className="relative max-w-4xl max-h-screen">
                                        <img
                                        src={previewImage}
                                        alt="previewImage"
                                        className="max-w-full max-h-screen"
                                        />
                                        <button
                                        onClick={()=>{
                                            setShowFullscreenPreview(false)
                                        }}
                                        className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition"
                                        >
                                        ×
                                        </button>
                                        <div className="absolute bottom-2 right-2 transition-opacity">
                                        <button
                                        className="bg-amber-700/60 text-white px-3 py-1 rounded-lg hover:bg-amber-700"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const link = document.createElement('a');
                                            link.href = previewImage ? previewImage : '';
                                            link.download = `result--${Date.now()}.jpg`;
                                            document.body.appendChild(link);
                                            link.click();
                                            document.body.removeChild(link);
                                        }}
                                        >
                                        {editor.right_box.download_btn}
                                        </button>
                                    </div>
                                    </div>
                                   
                                </div>
                            )} 
                            { !resultImage && !isPolling && !isload && (
                              <div className="mt-4 text-center text-gray-500">
                                <p>{editor.right_box.upload_example}</p>
                                <div className="flex gap-2 mt-2 justify-center">
                                  {[
                                    "https://ailab-resource-shanghai.oss-cn-shanghai.aliyuncs.com/examples/hairstyle-1.jpeg",
                                    "https://ailab-resource-shanghai.oss-cn-shanghai.aliyuncs.com/examples/hairstyle-2.jpeg",
                                    "https://ailab-resource-shanghai.oss-cn-shanghai.aliyuncs.com/examples/hairstyle-3.jpeg",
                                    "https://ailab-resource-shanghai.oss-cn-shanghai.aliyuncs.com/examples/hairstyle-4.png"
                                  ].map((src, index) => (
                                    <img 
                                      key={index}
                                      src={src} 
                                      alt={`Sample ${index + 1}`} 
                                      className="w-12 h-13 rounded-lg object-cover cursor-pointer hover:ring-2 hover:ring-amber-600 transition-all hide-scissors"
                                      onClick={() => handleSampleClick(src)}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                    )}
                </div>
            </section>

            {/* 历史记录组件 */}
            <HairHistory newResult={latestResult} onRetry={handleHistoryRetry} />
        </>
    );
};
