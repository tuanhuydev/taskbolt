import { defineStore } from 'pinia'

interface UserDetail {
  // id: string;
  email: string;
  name: string;
  id?: string;
  // avatar?: string;
  // accountType: AccountType;
  // roleId?: string;
  // ownerId?: string;
  // status: AccountStatus;
  // createdAt: string; // ISO 8601 format
  // updatedAt: string; // ISO 8601 format
  // deletedAt?: string; // ISO 8601 format
}

export const useUserStore = defineStore('user', {
    state: () => ({
        user: null as UserDetail | null,
    }),
    actions: {
        setUser(user: UserDetail) {
            this.user = user;
        },
    },
})