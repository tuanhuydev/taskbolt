import { APP_AUTH_URL } from "@/shared/lib/constants";
import { ApiClient } from "@/shared/types/shell-services";
import { Comment, CreateCommentPayload, UpdateCommentPayload } from "@/shared/types/comment";

interface CommentResponse {
  comments: Array<Comment>;
  total: number;
}

export const getComments = async (apiClient: ApiClient, filter: Record<string, unknown> = {}) => {
  const queryParams = new URLSearchParams(filter as Record<string, string>).toString();
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/comment${queryParams ? `?${queryParams}` : ""}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch comments (${response.status})`);
    }

    const { comments }: CommentResponse = await response.json();
    return comments;
  } catch (error) {
    console.error("Error fetching comments:", error);
    throw error;
  }
};

export const createComment = async (apiClient: ApiClient, data: CreateCommentPayload) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/comment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create comment (${response.status})`);
    }

    const comment: Comment = await response.json();
    return comment;
  } catch (error) {
    console.error("Error creating comment:", error);
    throw error;
  }
};

export const updateComment = async (
  apiClient: ApiClient,
  commentId: string,
  data: UpdateCommentPayload,
) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/comment/${commentId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update comment (${response.status})`);
    }

    const comment: Comment = await response.json();
    return comment;
  } catch (error) {
    console.error("Error updating comment:", error);
    throw error;
  }
};

export const deleteComment = async (apiClient: ApiClient, commentId: string) => {
  try {
    const response = await apiClient.request(`${APP_AUTH_URL}/comment/${commentId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete comment (${response.status})`);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};
