export interface Comment {
  id: string;
  taskId: string;
  createdById: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface CreateCommentPayload {
  taskId: string;
  content: string;
}

export interface UpdateCommentPayload {
  content: string;
}
