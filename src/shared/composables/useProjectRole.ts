import { ref, watch, type Ref } from "vue";
import { useShellServices } from "@/shared/composables/useShellServices";
import { getProjectMembers } from "@/shared/services";
import { decodeJwtPayload } from "@/shared/lib/jwt";

/**
 * Resolves the current user's role on a project purely from its member list
 * (ResourceGrant-backed — see member.service.ts) joined against the caller's
 * own id from the JWT. This is a client-side UX gate only, mirroring but not
 * replacing the backend's authoritative admin-only check on project/sprint
 * edit and delete — it only recognizes a project-scoped ADMIN grant, so a
 * tenant-wide admin with no explicit grant on this particular project won't
 * see the gated buttons either, even though the backend would still allow
 * them through.
 */
export function useProjectRole(projectId: Ref<string | null | undefined>) {
  const { getApiClient } = useShellServices();

  const isAdmin = ref(false);
  const loading = ref(false);

  async function refresh() {
    const id = projectId.value;
    if (!id) {
      isAdmin.value = false;
      return;
    }

    const apiClient = getApiClient();
    const token = apiClient?.getAccessToken();
    const currentUserId = token ? decodeJwtPayload(token)?.sub : undefined;
    if (!apiClient || !currentUserId) {
      isAdmin.value = false;
      return;
    }

    loading.value = true;
    try {
      const members = await getProjectMembers(apiClient, id);
      const self = members.find((m) => m.userId === currentUserId);
      isAdmin.value = self?.role === "ADMIN";
    } catch (err) {
      console.error("Failed to resolve project role:", err);
      isAdmin.value = false;
    } finally {
      loading.value = false;
    }
  }

  watch(projectId, refresh, { immediate: true });

  return { isAdmin, loading, refresh };
}
