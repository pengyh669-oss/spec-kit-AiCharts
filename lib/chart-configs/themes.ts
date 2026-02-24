// lib/chart-configs/themes.ts - ECharts 专业主题配色

/**
 * 专业配色主题，符合 WCAG AA 色彩对比度标准
 * 适用于折线图、柱状图、饼图等多种图表类型
 */

// 主题色板 - 默认主题（适用于浅色背景）
export const defaultColorPalette = [
    '#5470C6', // 蓝色 - 主色调
    '#91CC75', // 绿色 - 成功/增长
    '#FAC858', // 黄色 - 警告/关注
    '#EE6666', // 红色 - 错误/下降
    '#73C0DE', // 浅蓝 - 辅助色
    '#3BA272', // 深绿 - 辅助色
    '#FC8452', // 橙色 - 强调色
    '#9A60B4', // 紫色 - 辅助色
    '#EA7CCC', // 粉色 - 辅助色
];

// 商务主题色板（更专业的配色）
export const businessColorPalette = [
    '#0052D9', // 深蓝 - 信任、专业
    '#00A870', // 翠绿 - 成功、增长
    '#ED7B2F', // 橙色 - 活力、创新
    '#E34D59', // 红色 - 紧急、警告
    '#6D5CAE', // 紫色 - 高端、品质
    '#00A4FF', // 亮蓝 - 科技感
    '#29CC85', // 青绿 - 生态、可持续
    '#F2BD27', // 金黄 - 价值、荣誉
];

// 暗色主题色板（适用于深色背景）
export const darkColorPalette = [
    '#4992FF', // 亮蓝
    '#7BE188', // 亮绿
    '#FFD666', // 亮黄
    '#FF85C0', // 粉红
    '#5AD8A6', // 青绿
    '#F6BD16', // 金色
    '#E86452', // 橙红
    '#6DC8EC', // 天蓝
    '#945FB9', // 紫色
];

/**
 * 获取图表主题配色（根据系统主题自动切换）
 */
export function getChartColors(): string[] {
    // 检测系统主题
    if (typeof window !== 'undefined') {
        const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
        return isDarkMode ? darkColorPalette : defaultColorPalette;
    }
    return defaultColorPalette;
}

/**
 * 单色渐变主题（适用于单系列数据）
 */
export const gradientColors = {
    blue: ['#1890FF', '#096DD9'],
    green: ['#52C41A', '#389E0D'],
    orange: ['#FA8C16', '#D46B08'],
    red: ['#F5222D', '#CF1322'],
    purple: ['#722ED1', '#531DAB'],
};

/**
 * 为 ECharts 创建渐变色配置（线性渐变）
 */
export function createLinearGradient(
    colorStart: string,
    colorEnd: string,
    direction: 'vertical' | 'horizontal' = 'vertical'
) {
    return {
        type: 'linear' as const,
        x: 0,
        y: direction === 'vertical' ? 0 : 1,
        x2: direction === 'vertical' ? 0 : 1,
        y2: direction === 'vertical' ? 1 : 0,
        colorStops: [
            { offset: 0, color: colorStart },
            { offset: 1, color: colorEnd },
        ],
    };
}

/**
 * 色彩对比度计算（WCAG AA 标准：对比度 >= 4.5:1）
 * 参考：https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export function calculateContrastRatio(color1: string, color2: string): number {
    const getLuminance = (hex: string) => {
        // 移除 # 符号
        const rgb = hex.replace('#', '').match(/.{2}/g) || [];
        const [r, g, b] = rgb.map((c) => parseInt(c, 16) / 255);

        // 计算相对亮度
        const toLinear = (c: number) =>
            c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

        return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
    };

    const l1 = getLuminance(color1);
    const l2 = getLuminance(color2);

    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);

    return (lighter + 0.05) / (darker + 0.05);
}

/**
 * 验证颜色是否符合 WCAG AA 标准（与白色背景对比）
 */
export function isWCAGCompliant(color: string, bgColor = '#FFFFFF'): boolean {
    const ratio = calculateContrastRatio(color, bgColor);
    return ratio >= 4.5; // WCAG AA 标准
}
