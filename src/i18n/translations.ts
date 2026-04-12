/**
 * Taskbolt i18n translations
 * These are added to the shell's i18next instance under the 'taskbolt' namespace
 */
export const taskboltTranslations = {
  en: {
    sidebar: {
      selectProject: 'Select project',
      projects: 'Projects',
      activeSprint: 'Active Sprint',
      backlogs: 'Backlogs',
      reports: 'Reports',
      configure: 'Configure',
    },
    header: {
      searchPlaceholder: 'Search issues...',
      newIssue: 'New issue',
    },
    activeSprint: {
      title: 'Active Sprint',
      noSprint: 'No active sprint',
      empty: 'No issues in this sprint',
    },
    backlogs: {
      title: 'Backlogs',
      empty: 'No backlog items',
    },
    reports: {
      title: 'Reports',
    },
    configure: {
      title: 'Configure',
    },
    common: {
      save: 'Save',
      cancel: 'Cancel',
      edit: 'Edit',
      delete: 'Delete',
      create: 'Create',
      loading: 'Loading...',
      noData: 'No data available',
    },
  },
  vi: {
    sidebar: {
      selectProject: 'Chọn dự án',
      projects: 'Dự án',
      activeSprint: 'Sprint hiện tại',
      backlogs: 'Backlogs',
      reports: 'Báo cáo',
      configure: 'Cấu hình',
    },
    header: {
      searchPlaceholder: 'Tìm kiếm issue...',
      newIssue: 'Tạo issue mới',
    },
    activeSprint: {
      title: 'Sprint hiện tại',
      noSprint: 'Không có sprint nào đang hoạt động',
      empty: 'Không có issue nào trong sprint này',
    },
    backlogs: {
      title: 'Backlogs',
      empty: 'Không có mục nào trong backlog',
    },
    reports: {
      title: 'Báo cáo',
    },
    configure: {
      title: 'Cấu hình',
    },
    common: {
      save: 'Lưu',
      cancel: 'Hủy',
      edit: 'Sửa',
      delete: 'Xóa',
      create: 'Tạo mới',
      loading: 'Đang tải...',
      noData: 'Không có dữ liệu',
    },
  },
} as const;

export type TaskboltTranslations = typeof taskboltTranslations.en;
