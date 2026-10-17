/* eslint-disable @next/next/no-img-element */
"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

export type DocumentItem = {
  id: string;
  workspace_id: string;
  uploaded_by: string;
  title: string;
  description: string | null;
  category: string;
  file_name: string;
  file_path?: string | null;
  mime_type: string;
  file_size: number;
  created_at: string;
};

type DocumentsPageClientProps = {
  workspaceId: string;
  initialDocuments?: DocumentItem[];
  role: string;
  canUpload: boolean;
  canManage: boolean;
};

type UploadDocumentModalProps = {
  workspaceId: string;
  onClose: () => void;
  onUploaded: (document: DocumentItem) => void;
};

type DocumentPreviewModalProps = {
  title: string;
  fileName: string;
  mimeType: string;
  url: string;
  isPdf: boolean;
  isImage: boolean;
  onClose: () => void;
  onDownload: () => void;
};

type Folder = {
  name: string;
  value: string;
  description: string;
};

const FOLDERS: Folder[] = [
  {
    name: "All documents",
    value: "All",
    description: "Everything in your workspace",
  },
  {
    name: "Invoices",
    value: "Invoice",
    description: "Supplier and customer invoices",
  },
  {
    name: "Quotations",
    value: "Quotation",
    description: "Quotes and proposals",
  },
  {
    name: "Receipts",
    value: "Receipt",
    description: "Receipts and payment evidence",
  },
  {
    name: "Contracts",
    value: "Contract",
    description: "Contracts and agreements",
  },
  {
    name: "Tax documents",
    value: "Tax",
    description: "Tax and compliance files",
  },
  {
    name: "Other",
    value: "Other",
    description: "Other business documents",
  },
];

const CATEGORIES = [
  "Other",
  "Invoice",
  "Quotation",
  "Receipt",
  "Contract",
  "Tax",
  "Bank",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
]);

export default function DocumentsPageClient({
  workspaceId,
  initialDocuments,
  role,
  canUpload,
  canManage,
}: DocumentsPageClientProps) {
  const [documents, setDocuments] = useState<DocumentItem[]>(
    Array.isArray(initialDocuments) ? initialDocuments : [],
  );
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [activeFolder, setActiveFolder] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const filteredDocuments = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = documents.filter((document) => {
      const matchesFolder =
        activeFolder === "All" || document.category === activeFolder;

      if (!matchesFolder) return false;
      if (!query) return true;

      return [
        document.title,
        document.file_name,
        document.description ?? "",
        document.category,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });

    return [...filtered].sort((first, second) => {
      if (sortBy === "name") {
        return first.title.localeCompare(second.title);
      }

      if (sortBy === "oldest") {
        return (
          new Date(first.created_at).getTime() -
          new Date(second.created_at).getTime()
        );
      }

      return (
        new Date(second.created_at).getTime() -
        new Date(first.created_at).getTime()
      );
    });
  }, [documents, activeFolder, searchQuery, sortBy]);

  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {
      All: documents.length,
    };

    for (const folder of FOLDERS) {
      if (folder.value !== "All") {
        counts[folder.value] = documents.filter(
          (document) => document.category === folder.value,
        ).length;
      }
    }

    return counts;
  }, [documents]);

  function handleUploaded(newDocument: DocumentItem) {
    setDocuments((current) => [newDocument, ...current]);
  }

  function handleDeleted(documentId: string) {
    setDocuments((current) =>
      current.filter((document) => document.id !== documentId),
    );
  }

  return (
    <>
      <section className="space-y-6">
        <div className="flex flex-col justify-between gap-5 rounded-3xl border border-border bg-card p-6 shadow-sm lg:flex-row lg:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
              {role}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
              Workspace documents
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Organize and find your business files quickly.
            </p>
          </div>

          {canUpload ? (
            <button
              type="button"
              onClick={() => setIsUploadOpen(true)}
              className="rounded-xl bg-orange-500 px-5 py-3 font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Upload document
            </button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          <aside className="rounded-3xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 px-3">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Folders
              </p>
            </div>

            <div className="space-y-1">
              {FOLDERS.map((folder) => {
                const isActive = activeFolder === folder.value;

                return (
                  <button
                    key={folder.value}
                    type="button"
                    onClick={() => setActiveFolder(folder.value)}
                    className={[
                      "flex w-full items-center justify-between rounded-xl px-3 py-3 text-left transition",
                      isActive
                        ? "bg-orange-50 text-orange-700"
                        : "text-muted-foreground hover:bg-muted/45",
                    ].join(" ")}
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">
                        {folder.name}
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {folder.description}
                      </span>
                    </span>
                    <span
                      className={[
                        "ml-3 rounded-full px-2 py-1 text-xs font-semibold",
                        isActive
                          ? "bg-orange-100 text-orange-700"
                          : "bg-muted text-muted-foreground",
                      ].join(" ")}
                    >
                      {folderCounts[folder.value] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div className="min-w-0 space-y-5">
            <div className="flex flex-col gap-3 rounded-3xl border border-border bg-card p-4 shadow-sm sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Search documents..."
                  className="w-full rounded-xl border border-border bg-muted/45 px-4 py-3 pl-11 text-sm outline-none transition focus:border-orange-500 focus:bg-card focus:ring-4 focus:ring-orange-100"
                />
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                  ⌕
                </span>
              </div>

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="rounded-xl border border-border bg-muted/45 px-4 py-3 text-sm text-foreground outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
              >
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name">Name A–Z</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground">
                  {activeFolder === "All"
                    ? "All documents"
                    : `${activeFolder} documents`}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {filteredDocuments.length} result
                  {filteredDocuments.length === 1 ? "" : "s"}
                </p>
              </div>

              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="text-sm font-semibold text-orange-600 hover:text-orange-700"
                >
                  Clear search
                </button>
              ) : null}
            </div>

            {filteredDocuments.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-2xl">
                  📁
                </div>
                <h3 className="mt-4 font-semibold text-foreground">
                  No documents found
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Try another search or upload a new document.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {filteredDocuments.map((document) => (
                  <DocumentCard
                    key={document.id}
                    document={document}
                    canManage={canManage}
                    onDeleted={handleDeleted}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {isUploadOpen ? (
        <UploadDocumentModal
          workspaceId={workspaceId}
          onClose={() => setIsUploadOpen(false)}
          onUploaded={handleUploaded}
        />
      ) : null}
    </>
  );
}

type DocumentCardProps = {
  document: DocumentItem;
  canManage: boolean;
  onDeleted: (documentId: string) => void;
};

function DocumentCard({
  document,
  canManage,
  onDeleted,
}: DocumentCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const isPdf = document.mime_type === "application/pdf";
  const isImage = document.mime_type.startsWith("image/");

  async function getSignedUrl(download = false) {
    const endpoint = download
      ? `/api/documents/${document.id}/download/file`
      : `/api/documents/${document.id}/download`;

    const response = await fetch(endpoint);
    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.error ?? "Could not access document.",
      );
    }

    return result;
  }

  async function handlePreview() {
    try {
      setError("");
      setIsLoading(true);

      const result = await getSignedUrl(false);
      setPreviewUrl(result.url);
      setIsPreviewOpen(true);
    } catch (previewError) {
      setError(
        previewError instanceof Error
          ? previewError.message
          : "Could not preview document.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDownload() {
    try {
      setError("");

      const result = await getSignedUrl(true);
      const link = window.document.createElement("a");
      link.href = result.url;
      link.download = result.fileName ?? document.file_name;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      window.document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "Could not download document.",
      );
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete "${document.title}"?`)) {
      return;
    }

    try {
      setError("");
      setIsDeleting(true);

      const response = await fetch(`/api/documents/${document.id}`, {
        method: "DELETE",
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Could not delete document.",
        );
      }

      onDeleted(document.id);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Could not delete document.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <>
      <article className="rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h4 className="truncate font-semibold text-foreground">
              {document.title}
            </h4>
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-orange-500">
              {document.category}
            </p>
          </div>

          <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-medium text-muted-foreground">
            {document.mime_type.split("/").at(-1)?.toUpperCase() ?? "FILE"}
          </span>
        </div>

        {document.description ? (
          <p className="mt-4 line-clamp-3 text-sm text-muted-foreground">
            {document.description}
          </p>
        ) : null}

        <p className="mt-4 truncate text-xs text-muted-foreground">
          {document.file_name}
        </p>

        <div className="mt-5 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handlePreview}
            disabled={isLoading}
            className="rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted/45 disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Preview"}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg bg-neutral-950 px-3 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Download
          </button>

          {canManage ? (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="ml-auto rounded-lg px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          ) : null}
        </div>

        {error ? (
          <p className="mt-3 text-xs text-red-600">{error}</p>
        ) : null}
      </article>

      {isPreviewOpen ? (
        <DocumentPreviewModal
          title={document.title}
          fileName={document.file_name}
          mimeType={document.mime_type}
          url={previewUrl}
          isPdf={isPdf}
          isImage={isImage}
          onClose={() => {
            setIsPreviewOpen(false);
            setPreviewUrl("");
          }}
          onDownload={handleDownload}
        />
      ) : null}
    </>
  );
}

function DocumentPreviewModal({
  title,
  fileName,
  mimeType,
  url,
  isPdf,
  isImage,
  onClose,
  onDownload,
}: DocumentPreviewModalProps) {
  useEffect(() => {
    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    }

    window.document.addEventListener("keydown", handleEscape);

    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.document.removeEventListener("keydown", handleEscape);
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-neutral-950/70 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="document-preview-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="flex h-[calc(100dvh-2rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl bg-card shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border px-5 py-4">
          <div className="min-w-0">
            <h2
              id="document-preview-title"
              className="truncate text-lg font-semibold text-foreground"
            >
              {title}
            </h2>
            <p className="truncate text-sm text-muted-foreground">
              {fileName}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onDownload}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
            >
              Download
            </button>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full text-2xl text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Close preview"
            >
              ×
            </button>
          </div>
        </header>

        <main className="min-h-0 flex-1 bg-muted p-3 sm:p-6">
          {isPdf ? (
            <iframe
              src={url}
              title={`Preview of ${fileName}`}
              className="h-full min-h-0 w-full rounded-xl border border-border bg-card"
            />
          ) : isImage ? (
            <div className="flex h-full items-center justify-center overflow-auto rounded-xl bg-neutral-950 p-4">
              <img
                src={url}
                alt={title}
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-xl bg-card p-8 text-center">
              <p className="text-lg font-semibold text-foreground">
                Preview is not available
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                This file type cannot be previewed in the browser.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{mimeType}</p>
              <button
                type="button"
                onClick={onDownload}
                className="mt-5 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600"
              >
                Download file
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function UploadDocumentModal({
  workspaceId,
  onClose,
  onUploaded,
}: UploadDocumentModalProps) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    titleInputRef.current?.focus();

    const previousOverflow = window.document.body.style.overflow;
    window.document.body.style.overflow = "hidden";

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && !isUploading) {
        event.preventDefault();
        onClose();
      }
    }

    window.document.addEventListener("keydown", handleEscape);

    return () => {
      window.document.body.style.overflow = previousOverflow;
      window.document.removeEventListener("keydown", handleEscape);
    };
  }, [isUploading, onClose]);

  function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selectedFile = event.target.files?.[0] ?? null;
    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (selectedFile.size <= 0 || selectedFile.size > MAX_FILE_SIZE) {
      setError("Choose a file smaller than 10 MB.");
      setFile(null);
      return;
    }

    if (!ALLOWED_MIME_TYPES.has(selectedFile.type)) {
      setError("This file type is not supported.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!workspaceId) {
      setError("Workspace ID is missing.");
      return;
    }

    if (!title.trim()) {
      setError("Document title is required.");
      return;
    }

    if (!file) {
      setError("Please select a file.");
      return;
    }

    try {
      setIsUploading(true);

      const formData = new FormData();
      formData.append("workspaceId", workspaceId);
      formData.append("title", title.trim());
      formData.append("category", category);
      formData.append("description", description.trim());
      formData.append("file", file);

      const response = await fetch("/api/documents/upload", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ?? "Could not upload document.",
        );
      }

      onUploaded(result.document as DocumentItem);
      onClose();
    } catch (uploadError) {
      setError(
        uploadError instanceof Error
          ? uploadError.message
          : "Could not upload document.",
      );
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-neutral-950/60 p-4 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-document-title"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isUploading) {
          onClose();
        }
      }}
    >
      <div className="flex min-h-full items-start justify-center sm:items-center">
        <div
          className="my-4 flex max-h-[calc(100dvh-2rem)] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-card shadow-2xl sm:my-0"
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between border-b border-border px-5 py-4 sm:px-7">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-500">
                Workspace files
              </p>
              <h2
                id="upload-document-title"
                className="mt-1 text-2xl font-semibold text-foreground"
              >
                Upload document
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              aria-label="Close upload dialog"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full text-2xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-7">
              <div className="space-y-6">
                {error ? (
                  <div
                    role="alert"
                    className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {error}
                  </div>
                ) : null}

                <div>
                  <label
                    htmlFor="document-title"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    Document title
                  </label>
                  <input
                    ref={titleInputRef}
                    id="document-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Invoice from supplier"
                    disabled={isUploading}
                    className="w-full rounded-2xl border border-border bg-muted/45 px-5 py-4 outline-none focus:border-orange-500 focus:bg-card focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="document-category"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    Folder
                  </label>
                  <select
                    id="document-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    disabled={isUploading}
                    className="w-full rounded-2xl border border-border bg-muted/45 px-5 py-4 outline-none focus:border-orange-500 focus:bg-card focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="document-description"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    Description
                  </label>
                  <textarea
                    id="document-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Optional description"
                    rows={4}
                    disabled={isUploading}
                    className="w-full resize-y rounded-2xl border border-border bg-muted/45 px-5 py-4 outline-none focus:border-orange-500 focus:bg-card focus:ring-4 focus:ring-orange-100 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label
                    htmlFor="document-file"
                    className="mb-2 block text-sm font-semibold text-foreground"
                  >
                    File
                  </label>
                  <input
                    id="document-file"
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx,.xls,.xlsx"
                    onChange={handleFileChange}
                    disabled={isUploading}
                    className="block w-full rounded-2xl border border-dashed border-border bg-muted/45 px-4 py-4 text-sm disabled:opacity-60"
                  />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Maximum file size: 10 MB.
                  </p>
                  {file ? (
                    <p className="mt-3 truncate rounded-xl bg-muted px-4 py-3 text-sm text-foreground">
                      {file.name}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-border bg-card px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="w-full rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-muted/45 disabled:opacity-50 sm:w-auto"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading}
                className="w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 sm:w-auto"
              >
                {isUploading ? "Uploading..." : "Upload document"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}