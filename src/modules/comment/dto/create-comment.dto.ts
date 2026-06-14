export class CreateCommentDto {
  targetType: string;
  targetId: number;
  parentId?: number;
  replyTo?: string;
  author?: string;
  content: string;
}
