export interface CreateMiniToolScanTaskDto {
  toolKey: string;
  sourceType: 'camera' | 'album' | 'file';
  fileNames?: string[];
  pageCount?: number;
}
