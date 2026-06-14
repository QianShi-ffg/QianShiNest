export type MiniToolCategory = 'image' | 'video' | 'health' | 'text' | 'file';
export type MiniToolEntry = 'detail' | 'bmi' | 'translate' | 'scan';

export interface MiniToolDefinition {
  key: string;
  title: string;
  subtitle: string;
  summary: string;
  accent: string;
  softAccent: string;
  icon: string;
  category: MiniToolCategory;
  entry: MiniToolEntry;
  features: string[];
}

export const miniToolDefinitions: MiniToolDefinition[] = [
  {
    key: 'image-watermark',
    title: '图片去水印',
    subtitle: '上传图片，清理水印痕迹',
    summary: '选择图片后标记水印区域，后续接入图像修复服务生成干净图片。',
    accent: '#5A9CF8',
    softAccent: '#EDF5FF',
    icon: 'image',
    category: 'image',
    entry: 'detail',
    features: ['图片选择', '水印区域标记', '预览对比', '图片导出'],
  },
  {
    key: 'video-watermark',
    title: '视频去水印',
    subtitle: '处理短视频水印区域',
    summary: '导入视频并选择水印位置，后续接入视频处理服务输出去水印版本。',
    accent: '#FF8A3D',
    softAccent: '#FFF4ED',
    icon: 'video',
    category: 'video',
    entry: 'detail',
    features: ['视频导入', '水印区域选择', '片段预览', '视频导出'],
  },
  {
    key: 'bmi',
    title: 'BMI 计算',
    subtitle: '身高体重健康参考',
    summary: '输入身高和体重，计算 BMI 指数并给出基础区间参考。',
    accent: '#22C55E',
    softAccent: '#E9F9EF',
    icon: 'chart',
    category: 'health',
    entry: 'bmi',
    features: ['身高体重输入', 'BMI 指数计算', '健康区间参考', '本地即时计算'],
  },
  {
    key: 'translate',
    title: '极简翻译',
    subtitle: '轻量文本翻译工具',
    summary: '输入短文本并选择目标语言，提供轻量翻译交互骨架。',
    accent: '#7C7CF2',
    softAccent: '#F1F1FF',
    icon: 'translate',
    category: 'text',
    entry: 'translate',
    features: ['文本输入', '目标语言选择', '翻译结果展示', '一键复制'],
  },
  {
    key: 'file-scan',
    title: '文件扫描',
    subtitle: '文档扫描、自动裁边、OCR、PDF/JPG 导出',
    summary: '拍照或导入图片，自动切边、透视矫正并生成 PDF/JPG，OCR 能力作为后续处理服务接入。',
    accent: '#0B9FBD',
    softAccent: '#E8F8FB',
    icon: 'scan',
    category: 'file',
    entry: 'scan',
    features: ['拍照扫描', '自动裁边', '透视矫正', '高清增强', 'OCR 识别', 'PDF/JPG 导出'],
  },
];

export function findMiniToolDefinition(key: string) {
  return miniToolDefinitions.find((tool) => tool.key === key);
}
