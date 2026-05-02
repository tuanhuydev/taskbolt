/**
 * Taskbolt i18n translations
 * These are added to the shell's i18next instance under the 'taskbolt' namespace
 */
export const taskboltTranslations = {
  en: {
    sidebar: {
      selectProject: 'Select project',
      projects: 'Projects',
      personalWorkspace: 'Personal workspace',
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
    taskForm: {
      createTitle: 'Create Task',
      editTitle: 'Edit Task',
      titleLabel: 'Title',
      titlePlaceholder: 'Enter task title',
      descriptionLabel: 'Description',
      descriptionPlaceholder: 'Enter task description...',
      typeLabel: 'Type',
      statusLabel: 'Status',
      priorityLabel: 'Priority',
      storyPointLabel: 'Story Points',
      storyPointPlaceholder: 'e.g., 1, 2, 3, 5, 8',
      submitButton: 'Create Task',
      updateButton: 'Update Task',
      cancelButton: 'Cancel',
      requiredField: 'This field is required',
    },
    taskType: {
      STORY: 'Story',
      EPIC: 'Epic',
      ISSUE: 'Issue',
      BUG: 'Bug',
    },
    taskStatus: {
      TODO: 'To Do',
      IN_PROGRESS: 'In Progress',
      IN_REVIEW: 'In Review',
      DONE: 'Done',
    },
    taskPriority: {
      HIGHEST: 'Highest',
      HIGH: 'High',
      MEDIUM: 'Medium',
      LOW: 'Low',
    },
  },
  vi: {
    sidebar: {
      selectProject: 'Chọn dự án',
      projects: 'Dự án',
      personalWorkspace: 'Không gian cá nhân',
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
    taskForm: {
      createTitle: 'Tạo Công Việc',
      editTitle: 'Chỉnh Sửa Công Việc',
      titleLabel: 'Tiêu đề',
      titlePlaceholder: 'Nhập tiêu đề công việc',
      descriptionLabel: 'Mô tả',
      descriptionPlaceholder: 'Nhập mô tả công việc...',
      typeLabel: 'Loại',
      statusLabel: 'Trạng thái',
      priorityLabel: 'Mức độ ưu tiên',
      storyPointLabel: 'Độ phức tạp',
      storyPointPlaceholder: 'vd: 1, 2, 3, 5, 8',
      submitButton: 'Tạo Công Việc',
      updateButton: 'Cập Nhật Công Việc',
      cancelButton: 'Hủy',
      requiredField: 'Trường này là bắt buộc',
    },
    taskType: {
      STORY: 'Câu chuyện',
      EPIC: 'Epic',
      ISSUE: 'Vấn đề',
      BUG: 'Lỗi',
    },
    taskStatus: {
      TODO: 'Cần làm',
      IN_PROGRESS: 'Đang thực hiện',
      IN_REVIEW: 'Đang xem xét',
      DONE: 'Hoàn thành',
    },
    taskPriority: {
      HIGHEST: 'Cao nhất',
      HIGH: 'Cao',
      MEDIUM: 'Trung bình',
      LOW: 'Thấp',
    },
  },
} as const;

export type TaskboltTranslations = typeof taskboltTranslations.en;
