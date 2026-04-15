export interface Comment {
  id: number;
  bugId: number;
  authorId: number;
  authorName: string;
  authorAvatarUrl?: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentRequest {
  content: string;
  isInternal?: boolean;
}
