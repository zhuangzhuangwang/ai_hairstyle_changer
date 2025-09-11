import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { HistoryRecord } from '@/types/pages/hair.d';
import { useTranslations } from 'next-intl';

type HairHistoryProps = {
  newResult?: { originalImageSrc: string; resultImageSrcs: string[] };
  onRetry: (originalImage: string) => void;
};

export default function HairHistory({ newResult, onRetry }: HairHistoryProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [previewImage, setPreviewImage] = useState<string | undefined>(undefined); // 新增状态
  const [showFullscreenPreview, setShowFullscreenPreview] = useState(false); // 新增状态
  const t = useTranslations();

  useEffect(() => {
    if (newResult && newResult.originalImageSrc && newResult.resultImageSrcs.length > 0) {
      setHistory((prevHistory) => {
        const newRecord: HistoryRecord = {
          id: Date.now().toString(), // 简单的唯一ID
          originalImageSrc: newResult.originalImageSrc,
          resultImageSrcs: newResult.resultImageSrcs,
        };
        const updatedHistory = [newRecord, ...prevHistory];
        // 最多保留5条记录
        return updatedHistory.slice(0, 5);
      });
    }
  }, [newResult]);

  return (
    <div className="container mx-auto mt-8 p-4 rounded-lg dementor shadow-lg shadow-gray-500/50">
      {/* <h3 className="text-lg font-semibold mb-4 text-white">{t("history.title")}</h3> */}
      {history.length === 0 ? (
        <p className="text-gray-300">{t("history.empty")}</p>
      ) : (
        <div className="flex flex-col gap-4">
          {history.map((record) => (
            <div key={record.id} className="flex flex-col sm:flex-row items-center gap-2 border-b border-gray-600 pb-4 last:border-b-0 last:pb-0">
              {/* 原图 */}
              <div className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-500 p-1">
                <img src={record.originalImageSrc} alt="Original" className="w-full h-full object-cover rounded-md" />
                <span className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-1">{t("history.original_image")}</span>
              </div>

              {/* 结果图 */}
              <div className="flex gap-2 flex-grow overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-700 p-1">
                {record.resultImageSrcs.slice(0, 4).map((resultSrc, index) => (
                  <div key={index} className="relative w-32 h-32 flex-shrink-0 rounded-lg overflow-hidden border border-gray-500 p-1">
                    <img
                      src={resultSrc}
                      alt={`Result ${index + 1}`}
                      className="w-full h-full object-cover rounded-md cursor-zoom-in"
                      onClick={() => {
                        setPreviewImage(resultSrc);
                        setShowFullscreenPreview(true);
                      }}
                    />
                    <span className="absolute bottom-0 left-0 bg-black/50 text-white text-xs px-1">{t("history.result_image")}{index + 1}</span>
                  </div>
                ))}
              </div>

              {/* 重试按钮 */}
              <Button
                onClick={() => onRetry(record.originalImageSrc)}
                variant="outline"
                className="flex-shrink-0 w-20 text-white bg-amber-700/60 hover:bg-amber-700 border-amber-700/60 hover:border-amber-700"
              >
                {t("history.retry_btn")}
              </Button>
            </div>
          ))}
        </div>
      )}

      {showFullscreenPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-screen">
            <img
              src={previewImage}
              alt="previewImage"
              className="max-w-full max-h-screen"
            />
            <button
              onClick={() => {
                setShowFullscreenPreview(false);
              }}
              className="absolute top-4 right-4 bg-white text-black rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold hover:bg-gray-200 transition"
            >
              ×
            </button>
            <div className="absolute bottom-2 right-2 transition-opacity">
              <Button
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
                {t("history.download_btn")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
