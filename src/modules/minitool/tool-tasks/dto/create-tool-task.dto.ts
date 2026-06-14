export interface CreateMiniToolTaskDto {
  toolKey: string;
  sourceType: 'image' | 'video' | 'text' | 'form';
  fileName?: string;
  region?: 'top-right' | 'bottom-right' | 'center';
  options?: Record<string, string | number | boolean>;
  inputText?: string;
  outputText?: string;
  resultTitle?: string;
}
