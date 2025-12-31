<template>
  <div class="rich-text-editor" :class="className">
    <!-- Toolbar -->
    <div class="editor-toolbar">
      <div class="toolbar-content">
        <!-- Text Formatting Group -->
        <div class="tool-group">
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('bold') }"
            @click="editor?.chain().focus().toggleBold().run()"
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </button>
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('italic') }"
            @click="editor?.chain().focus().toggleItalic().run()"
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </button>
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('underline') }"
            @click="editor?.chain().focus().toggleUnderline().run()"
            title="Underline (Ctrl+U)"
          >
            <u>U</u>
          </button>
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('strike') }"
            @click="editor?.chain().focus().toggleStrike().run()"
            title="Strikethrough"
          >
            <s>S</s>
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Headings Group -->
        <div class="tool-group">
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('heading', { level: 1 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 1 }).run()"
            title="Heading 1"
          >
            H1
          </button>
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('heading', { level: 2 }) }"
            @click="editor?.chain().focus().toggleHeading({ level: 2 }).run()"
            title="Heading 2"
          >
            H2
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Lists Group -->
        <div class="tool-group">
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('bulletList') }"
            @click="editor?.chain().focus().toggleBulletList().run()"
            title="Bullet List"
          >
            •
          </button>
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('orderedList') }"
            @click="editor?.chain().focus().toggleOrderedList().run()"
            title="Numbered List"
          >
            1.
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Text Alignment Group -->
        <div class="tool-group">
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive({ textAlign: 'left' }) }"
            @click="editor?.chain().focus().setTextAlign('left').run()"
            title="Align Left"
          >
            ←
          </button>
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive({ textAlign: 'center' }) }"
            @click="editor?.chain().focus().setTextAlign('center').run()"
            title="Align Center"
          >
            ↔
          </button>
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive({ textAlign: 'right' }) }"
            @click="editor?.chain().focus().setTextAlign('right').run()"
            title="Align Right"
          >
            →
          </button>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Links and Media Group -->
        <div class="tool-group">
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('link') }"
            @click="setLink"
            title="Insert Link"
          >
            🔗
          </button>
          
          <!-- Image Upload -->
          <div class="image-input-group">
            <input
              type="text"
              class="image-input"
              placeholder="Image URL"
              v-model="imageUrl"
              @keypress.enter="addImage"
            />
            <button
              type="button"
              class="image-button"
              @click="addImage"
              title="Insert Image"
            >
              🖼️
            </button>
          </div>
        </div>

        <div class="toolbar-divider"></div>

        <!-- Highlight Group -->
        <div class="tool-group">
          <button
            type="button"
            class="tool-button"
            :class="{ active: editor?.isActive('highlight') }"
            @click="editor?.chain().focus().toggleHighlight().run()"
            title="Highlight Text"
          >
            ✏️
          </button>
        </div>
      </div>
    </div>

    <!-- Editor Content -->
    <div class="editor-content-wrapper">
      <EditorContent :editor="editor" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
import { useEditor, EditorContent } from "@tiptap/vue-3";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";

interface Props {
  modelValue?: string;
  placeholder?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: "",
  placeholder: "Start writing...",
  className: "",
});

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const imageUrl = ref("");

const editor = useEditor({
  extensions: [
    StarterKit,
    Image,
    Link.configure({
      openOnClick: false,
    }),
    TextAlign.configure({
      types: ["heading", "paragraph"],
    }),
    Underline,
    TextStyle,
    Color,
    Highlight,
  ],
  content: props.modelValue,
  onUpdate: ({ editor }) => {
    emit("update:modelValue", editor.getHTML());
  },
  editorProps: {
    attributes: {
      class: "editor-content",
      placeholder: props.placeholder,
    },
  },
});

// Watch for external changes to modelValue
watch(
  () => props.modelValue,
  (newValue) => {
    if (editor.value && editor.value.getHTML() !== newValue) {
      editor.value.commands.setContent(newValue || "");
    }
  }
);

const addImage = () => {
  if (imageUrl.value && editor.value) {
    editor.value.chain().focus().setImage({ src: imageUrl.value }).run();
    imageUrl.value = "";
  }
};

const setLink = () => {
  if (!editor.value) return;
  
  const url = window.prompt("Enter the URL");
  if (url) {
    editor.value.chain().focus().setLink({ href: url }).run();
  }
};

onBeforeUnmount(() => {
  editor.value?.destroy();
});
</script>

<style scoped>
.rich-text-editor {
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  overflow: hidden;
}

.editor-toolbar {
  background-color: #f8f9fa;
  border-bottom: 1px solid #ddd;
  padding: 8px;
}

.toolbar-content {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px;
}

.tool-group {
  display: flex;
  gap: 2px;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: #ddd;
  margin: 0 4px;
}

.tool-button {
  padding: 6px 10px;
  border: 1px solid transparent;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
}

.tool-button:hover {
  background-color: #e9ecef;
}

.tool-button.active {
  background-color: #5e72e4;
  color: #fff;
  border-color: #5e72e4;
}

.image-input-group {
  display: flex;
  gap: 4px;
  align-items: center;
}

.image-input {
  padding: 4px 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 12px;
  width: 150px;
  height: 32px;
}

.image-input:focus {
  outline: none;
  border-color: #5e72e4;
}

.image-button {
  padding: 6px 10px;
  border: 1px solid transparent;
  background-color: transparent;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  height: 32px;
  min-width: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-button:hover {
  background-color: #e9ecef;
}

.editor-content-wrapper {
  min-height: 300px;
  padding: 16px;
  background-color: #fff;
}

:deep(.editor-content),
:deep(.ProseMirror) {
  min-height: 300px;
  outline: none;
  font-size: 16px;
  line-height: 1.6;
  color: #000 !important;
  background-color: #fff !important;
  font-weight: normal;
  font-style: normal;
}

/* Ensure all text elements are black by default */
:deep(.ProseMirror *),
:deep(.editor-content *) {
  color: inherit;
}

:deep(.ProseMirror p),
:deep(.editor-content p),
:deep(.ProseMirror div),
:deep(.editor-content div),
:deep(.ProseMirror span),
:deep(.editor-content span) {
  color: #000 !important;
}

/* Placeholder styling */
:deep(.editor-content p.is-editor-empty:first-child::before) {
  content: attr(data-placeholder);
  float: left;
  color: #adb5bd;
  pointer-events: none;
  height: 0;
}

/* Paragraphs */
:deep(.editor-content p),
:deep(.ProseMirror p) {
  margin: 0.5em 0;
  color: #000 !important;
}

/* Headings */
:deep(.editor-content h1),
:deep(.ProseMirror h1) {
  font-size: 2em;
  font-weight: bold;
  margin: 0.67em 0;
  color: #000 !important;
}

:deep(.editor-content h2),
:deep(.ProseMirror h2) {
  font-size: 1.5em;
  font-weight: bold;
  margin: 0.75em 0;
  color: #000 !important;
}

/* Lists */
:deep(.editor-content ul),
:deep(.editor-content ol),
:deep(.ProseMirror ul),
:deep(.ProseMirror ol) {
  padding-left: 1.5em;
  margin: 0.5em 0;
  color: #000 !important;
}

:deep(.editor-content li),
:deep(.ProseMirror li) {
  margin: 0.25em 0;
  color: #000 !important;
}

/* Text formatting - CRITICAL for visibility */
:deep(.editor-content strong),
:deep(.editor-content b),
:deep(.ProseMirror strong),
:deep(.ProseMirror b) {
  font-weight: bold !important;
  color: #000 !important;
}

:deep(.editor-content em),
:deep(.editor-content i),
:deep(.ProseMirror em),
:deep(.ProseMirror i) {
  font-style: italic !important;
  color: #000 !important;
}

:deep(.editor-content u),
:deep(.ProseMirror u) {
  text-decoration: underline !important;
  color: #000 !important;
}

:deep(.editor-content s),
:deep(.editor-content strike),
:deep(.ProseMirror s),
:deep(.ProseMirror strike) {
  text-decoration: line-through !important;
  color: #000 !important;
}

/* Images */
:deep(.editor-content img) {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 1em 0;
}

/* Links */
:deep(.editor-content a) {
  color: #5e72e4;
  text-decoration: underline;
}

:deep(.editor-content a:hover) {
  color: #4c63d2;
}

/* Highlight */
:deep(.editor-content mark),
:deep(.ProseMirror mark) {
  background-color: #ffeb3b;
  padding: 2px 4px;
  border-radius: 2px;
  color: #000 !important;
}

/* Text alignment */
:deep(.editor-content [style*="text-align: left"]) {
  text-align: left;
}

:deep(.editor-content [style*="text-align: center"]) {
  text-align: center;
}

:deep(.editor-content [style*="text-align: right"]) {
  text-align: right;
}

:deep(.editor-content [style*="text-align: justify"]) {
  text-align: justify;
}

/* Code */
:deep(.editor-content code),
:deep(.ProseMirror code) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9em;
  color: #000 !important;
}

:deep(.editor-content pre) {
  background-color: rgba(0, 0, 0, 0.05);
  padding: 1em;
  border-radius: 4px;
  overflow-x: auto;
  margin: 1em 0;
}

:deep(.editor-content pre code) {
  background-color: transparent;
  padding: 0;
}

/* Blockquote */
:deep(.editor-content blockquote),
:deep(.ProseMirror blockquote) {
  border-left: 4px solid #5e72e4;
  padding-left: 1em;
  margin: 1em 0;
  color: #000 !important;
  font-style: italic;
}
</style>

