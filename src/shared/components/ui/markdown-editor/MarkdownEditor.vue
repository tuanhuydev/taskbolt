<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import {
  createEditor,
  $getRoot,
  $createParagraphNode,
  type LexicalEditor,
} from "lexical";
import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from "@lexical/markdown";
import { registerRichText, HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListNode, ListItemNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";
import { FORMAT_TEXT_COMMAND } from "lexical";
import { Bold, Italic, Code } from "lucide-vue-next";
import { cn } from "@/shared/lib/utils";
import type { HTMLAttributes } from "vue";

const props = defineProps<{
  modelValue?: string;
  placeholder?: string;
  class?: HTMLAttributes["class"];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const editorRef = ref<HTMLDivElement | null>(null);
const editorInstance = ref<LexicalEditor | null>(null);

// Initialize editor
onMounted(() => {
  if (!editorRef.value) return;

  const editor = createEditor({
    namespace: "MarkdownEditor",
    nodes: [HeadingNode, QuoteNode, ListNode, ListItemNode, LinkNode],
    onError: (error: Error) => {
      console.error("Lexical editor error:", error);
    },
  });

  // Register rich text plugin
  registerRichText(editor);

  // Set editor root element
  editor.setRootElement(editorRef.value);

  // Initialize with markdown if provided
  if (props.modelValue) {
    editor.update(() => {
      $convertFromMarkdownString(props.modelValue || "", TRANSFORMERS);
    });
  } else {
    editor.update(() => {
      const root = $getRoot();
      if (root.isEmpty()) {
        const paragraph = $createParagraphNode();
        root.append(paragraph);
      }
    });
  }

  // Listen to changes and emit markdown
  const removeUpdateListener = editor.registerUpdateListener(
    ({ editorState }) => {
      editorState.read(() => {
        const markdown = $convertToMarkdownString(TRANSFORMERS);
        emit("update:modelValue", markdown);
      });
    },
  );

  editorInstance.value = editor;

  // Cleanup
  onBeforeUnmount(() => {
    removeUpdateListener();
    editor.setRootElement(null);
  });
});

// Watch for external changes
watch(
  () => props.modelValue,
  (newValue) => {
    if (!editorInstance.value) return;

    editorInstance.value.update(() => {
      const currentMarkdown = $convertToMarkdownString(TRANSFORMERS);
      if (currentMarkdown !== newValue && newValue !== undefined) {
        const root = $getRoot();
        root.clear();
        $convertFromMarkdownString(newValue || "", TRANSFORMERS);
      }
    });
  },
);

// Toolbar actions
function formatBold() {
  if (!editorInstance.value) return;
  editorInstance.value.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
}

function formatItalic() {
  if (!editorInstance.value) return;
  editorInstance.value.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
}

function formatCode() {
  if (!editorInstance.value) return;
  editorInstance.value.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
}
</script>

<template>
  <div
    :class="cn('border rounded-md overflow-hidden bg-background', props.class)"
  >
    <!-- Toolbar -->
    <div class="flex items-center gap-1 p-2 border-b bg-muted/30">
      <button
        type="button"
        class="p-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
        title="Bold (Ctrl+B)"
        @click="formatBold"
      >
        <Bold class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="p-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
        title="Italic (Ctrl+I)"
        @click="formatItalic"
      >
        <Italic class="h-4 w-4" />
      </button>
      <button
        type="button"
        class="p-1.5 rounded hover:bg-accent hover:text-accent-foreground transition-colors"
        title="Code (Ctrl+`)"
        @click="formatCode"
      >
        <Code class="h-4 w-4" />
      </button>
      <div class="w-px h-5 bg-border mx-1" />
      <span class="text-xs text-muted-foreground px-2">Markdown supported</span>
    </div>

    <!-- Editor content -->
    <div
      ref="editorRef"
      contenteditable="true"
      :class="
        cn(
          'min-h-50 max-h-100 overflow-y-auto p-3 text-sm focus:outline-none',
          'prose prose-sm max-w-none dark:prose-invert',
        )
      "
      :data-placeholder="placeholder || 'Enter description...'"
    />
  </div>
</template>

<style scoped>
/* Placeholder styles */
[contenteditable]:empty:before {
  content: attr(data-placeholder);
  color: hsl(var(--muted-foreground));
  pointer-events: none;
  position: absolute;
}

[contenteditable]:focus {
  outline: none;
}

/* Lexical editor styles */
:deep(p) {
  margin: 0.5em 0;
}

:deep(h1) {
  font-size: 1.5em;
  font-weight: 600;
  margin: 1em 0 0.5em;
}

:deep(h2) {
  font-size: 1.25em;
  font-weight: 600;
  margin: 0.75em 0 0.5em;
}

:deep(h3) {
  font-size: 1.1em;
  font-weight: 600;
  margin: 0.75em 0 0.5em;
}

:deep(ul),
:deep(ol) {
  margin: 0.5em 0;
  padding-left: 1.5em;
}

:deep(li) {
  margin: 0.25em 0;
}

:deep(a) {
  color: hsl(var(--primary));
  text-decoration: underline;
}

:deep(code) {
  background-color: hsl(var(--muted));
  padding: 0.125em 0.25em;
  border-radius: 0.25em;
  font-size: 0.9em;
}

:deep(pre) {
  background-color: hsl(var(--muted));
  padding: 0.75em;
  border-radius: 0.375em;
  overflow-x: auto;
}

:deep(blockquote) {
  border-left: 3px solid hsl(var(--border));
  padding-left: 1em;
  margin: 0.75em 0;
  color: hsl(var(--muted-foreground));
}
</style>
