import React, { useState, useEffect } from 'react';
import type { Screenshot } from '@espionage/shared';

interface ScreenshotGalleryProps {
  screenshots: Screenshot[];
  workerId: string;
}

export function ScreenshotGallery({ screenshots, workerId }: ScreenshotGalleryProps): React.ReactElement {
  const [selectedScreenshot, setSelectedScreenshot] = useState<Screenshot | null>(null);
  const [screenshotUrls, setScreenshotUrls] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({});

  const loadScreenshotUrl = async (screenshot: Screenshot): Promise<void> => {
    if (screenshotUrls[screenshot.id]) return;

    setIsLoading((prev) => ({ ...prev, [screenshot.id]: true }));

    try {
      const url = await window.electronAPI.screenshotsGetUrl(screenshot.file_path);
      setScreenshotUrls((prev) => ({ ...prev, [screenshot.id]: url }));
    } catch (err) {
      console.error('Failed to load screenshot:', err);
    } finally {
      setIsLoading((prev) => ({ ...prev, [screenshot.id]: false }));
    }
  };

  useEffect(() => {
    // Load first 5 screenshots
    screenshots.slice(0, 5).forEach((screenshot) => {
      loadScreenshotUrl(screenshot);
    });
  }, [screenshots]);

  const handleImageClick = (screenshot: Screenshot): void => {
    setSelectedScreenshot(screenshot);
  };

  const handleCloseModal = (): void => {
    setSelectedScreenshot(null);
  };

  return (
    <div>
      {screenshots.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm text-center">
          <span className="text-5xl mb-4 block">📷</span>
          <p className="text-gray-600">No screenshots captured yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {screenshots.map((screenshot) => {
            const url = screenshotUrls[screenshot.id];
            const loading = isLoading[screenshot.id];

            return (
              <button
                key={screenshot.id}
                onClick={() => handleImageClick(screenshot)}
                className="relative bg-gray-200 rounded-lg overflow-hidden aspect-video group"
              >
                {loading ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-300">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                  </div>
                ) : url ? (
                  <>
                    <img
                      src={url}
                      alt={`Screenshot at ${new Date(screenshot.captured_at).toLocaleString()}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition" />
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        loadScreenshotUrl(screenshot);
                      }}
                      className="px-3 py-1 bg-white rounded-lg text-sm hover:bg-gray-100 transition"
                    >
                      Load
                    </button>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Modal for full-size view */}
      {selectedScreenshot && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={handleCloseModal}
        >
          <div className="max-w-4xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white rounded-xl overflow-hidden">
              <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="font-semibold text-gray-900">Screenshot</h3>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedScreenshot.captured_at).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
              <div className="p-4">
                {screenshotUrls[selectedScreenshot.id] ? (
                  <img
                    src={screenshotUrls[selectedScreenshot.id]}
                    alt="Screenshot"
                    className="w-full rounded-lg"
                  />
                ) : (
                  <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
