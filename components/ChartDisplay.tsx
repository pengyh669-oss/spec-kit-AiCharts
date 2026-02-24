// components/ChartDisplay.tsx - 图表显示区域组件

'use client';

import { useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChartRenderer, ChartRendererRef } from '@/components/charts/ChartRenderer';
import type { ChartConfig } from '@/types';

interface ChartDisplayProps {
    config: ChartConfig;
}

export function ChartDisplay({ config }: ChartDisplayProps) {
    const chartRef = useRef<ChartRendererRef>(null);

    const handleDownload = () => {
        if (chartRef.current) {
            // 使用图表标题作为文件名，或使用默认名称
            const title = config.option.title && typeof config.option.title === 'object' && 'text' in config.option.title
                ? config.option.title.text
                : '图表';
            const filename = `${title}_${new Date().getTime()}`;
            chartRef.current.downloadChart(filename);
        }
    };

    return (
        <div className="w-full max-w-6xl mx-auto animate-fadeIn">
            <Card className="p-6 shadow-lg">
                {/* 下载按钮 */}
                <div className="flex justify-end mb-4">
                    <Button
                        onClick={handleDownload}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        下载图表
                    </Button>
                </div>

                {/* 图表渲染区域 */}
                <ChartRenderer ref={chartRef} config={config} />
            </Card>
        </div>
    );
}
