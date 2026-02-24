// components/ChatInput.tsx - 底部聊天式输入框组件

'use client';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ChatInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    loading: boolean;
    error: string | null;
    placeholder?: string;
}

export function ChatInput({
    value,
    onChange,
    onSubmit,
    loading,
    error,
    placeholder = '继续输入新的数据...'
}: ChatInputProps) {
    return (
        <div className="w-full max-w-4xl mx-auto">
            <form onSubmit={onSubmit} className="flex gap-2">
                <Textarea
                    rows={3}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={loading}
                    className="flex-1 resize-none"
                />
                <Button
                    type="submit"
                    disabled={loading || !value.trim()}
                >
                    {loading ? '生成中...' : '生成'}
                </Button>
            </form>

            {/* 错误提示 */}
            {error && (
                <Alert variant="destructive" className="mt-2">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
        </div>
    );
}
