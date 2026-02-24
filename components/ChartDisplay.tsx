// components/ChartDisplay.tsx - 图表显示区域组件

'use client';

import { Card } from '@/components/ui/card';
import { ChartRenderer } from '@/components/charts/ChartRenderer';
import type { ChartConfig } from '@/types';

interface ChartDisplayProps {
    config: ChartConfig;
}

export function ChartDisplay({ config }: ChartDisplayProps) {
    return (
        <div className="w-full max-w-6xl mx-auto animate-fadeIn">
            <Card className="p-6 shadow-lg">
                <ChartRenderer config={config} />
            </Card>
        </div>
    );
}
