// types/models.ts - 用户输入和数据模型类型定义

export interface UserInput {
    /** 原始文本内容 */
    content: string;

    /** 提交时间戳（ISO 8601 格式） */
    submittedAt: string;

    /** 输入 ID（用于历史记录追踪） */
    id: string;

    /** 输入状态 */
    status: 'pending' | 'processing' | 'success' | 'error';

    /** 错误信息（如果状态为 error） */
    errorMessage?: string;
}

export interface DataSeries {
    /** 数据系列名称（如"北京"、"销售额"） */
    name: string;

    /** 数值数组 */
    data: number[];
}

export interface StructuredData {
    /** 数据系列数组（可以有多个系列，如北京和上海的对比） */
    series: DataSeries[];

    /** 类别/标签数组（X 轴标签，如月份、城市名） */
    labels: string[];

    /** 数据类型标识 */
    dataType: 'timeSeries' | 'categorical' | 'percentage';

    /** 数据单位（如"万元"、"%"） */
    unit?: string;

    /** 图表标题（从用户输入提取或自动生成） */
    title?: string;
}

export function validateUserInput(input: string): { valid: boolean; error?: string } {
    // 1. 非空验证
    if (!input.trim()) {
        return { valid: false, error: '输入内容不能为空' };
    }

    // 2. 长度验证
    if (input.length > 2000) {
        return { valid: false, error: '输入内容不能超过 2000 字符' };
    }

    // 3. 内容验证（可选，检查是否包含数字）
    const hasNumber = /\d/.test(input);
    if (!hasNumber) {
        return { valid: false, error: '输入内容应包含数值数据，例如："2024年1月销售额100万"' };
    }

    return { valid: true };
}

export function validateStructuredData(data: StructuredData): { valid: boolean; error?: string } {
    // 1. 系列非空
    if (!data.series || data.series.length === 0) {
        return { valid: false, error: '至少需要一个数据系列' };
    }

    // 2. 数据一致性
    const dataLength = data.labels.length;
    for (const series of data.series) {
        if (series.data.length !== dataLength) {
            return { valid: false, error: '数据系列长度与标签长度不一致' };
        }
    }

    // 3. 数据范围
    if (dataLength < 1 || dataLength > 1000) {
        return { valid: false, error: '数据点数量应在 1-1000 之间' };
    }

    return { valid: true };
}
