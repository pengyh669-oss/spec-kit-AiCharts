// app/page.tsx - AI 图表生成器主页

'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ChartDisplay } from '@/components/ChartDisplay';
import { ChatInput } from '@/components/ChatInput';
import { generateChart } from '@/lib/api-client';
import { validateUserInput } from '@/types';
import type { ChartConfig } from '@/types';

export default function Home() {
  // 状态管理
  const [userInput, setUserInput] = useState('');
  const [chartConfig, setChartConfig] = useState<ChartConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 处理表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 清除之前的错误
    setError(null);

    // 验证输入
    const validation = validateUserInput(userInput);
    if (!validation.valid) {
      setError(validation.error || '输入验证失败');
      return;
    }

    // 开始加载
    setLoading(true);

    try {
      // 调用 API 生成图表
      const response = await generateChart(userInput);
      setChartConfig(response.data);
    } catch (err: any) {
      setError(err.message || '图表生成失败，请稍后重试');
      console.error('Chart generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* 标题区域 */}
        <div className="text-center mb-8 animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            AI 图表生成器
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            用自然语言描述数据，AI 自动生成可视化图表
          </p>
        </div>

        {/* 主内容区域 */}
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          {/* 输入框区域 - 初始状态居中显示 */}
          {!chartConfig && (
            <Card className="w-full max-w-2xl p-8 animate-slideUp">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    placeholder="输入数据描述，可指定图表类型，如：用柱状图显示2024年1到6月销售额100、120、150、170、180、200万元"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    disabled={loading}
                    className="text-base h-12"
                  />
                </div>

                {/* 错误提示 */}
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {/* 提交按钮 */}
                <Button
                  type="submit"
                  disabled={loading || !userInput.trim()}
                  className="w-full h-12 text-base"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="animate-spin">⏳</span>
                      正在生成图表...
                    </span>
                  ) : (
                    '生成图表'
                  )}
                </Button>
              </form>

              {/* 示例提示 */}
              <div className="mt-6 text-sm text-gray-500 dark:text-gray-400">
                <p className="font-medium mb-2">💡 示例：</p>
                <ul className="space-y-1 list-disc list-inside">
                  <li>2024年各月销售额：1月100万，2月120万，3月150万</li>
                  <li>北京和上海的对比：北京120、130、150，上海100、140、160</li>
                  <li>市场份额：产品A占40%，产品B占35%，产品C占25%</li>
                  <li className="text-blue-600 dark:text-blue-400 font-medium">用柱状图显示各部门预算：研发500万，市场300万，销售400万</li>
                </ul>
              </div>
            </Card>
          )}

          {/* 图表显示区域 - 生成图表后显示 */}
          {chartConfig && (
            <div className="w-full space-y-6">
              {/* 图表卡片 */}
              <ChartDisplay config={chartConfig} />

              {/* 底部输入框 */}
              <div className="animate-slideUp">
                <ChatInput
                  value={userInput}
                  onChange={setUserInput}
                  onSubmit={handleSubmit}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
