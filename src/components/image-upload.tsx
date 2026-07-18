/**
 * ImageUpload — drop-in admin component for uploading a file or pasting a URL.
 *
 * Props:
 *   value     – current URL string
 *   onChange  – called with the new URL after upload or manual entry
 *   label     – field label
 *   accept    – mime-type filter for the file picker, e.g. "image/*" or "video/*"
 *   preview   – "image" | "video" | "none"  (default "image")
 *   className – extra wrapper className
 */

import { useRef, useState } from "react";
import { Upload, X, Loader2, Image as ImageIcon, Video } from "lucide-react";

type Props = {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  accept?: string;
  preview?: "image" | "video" | "none";
  className?: string;
  hint?: string;
};

export function ImageUpload({
  value,
  onChange,
  label,
  accept = "image/*",
  preview = "image",
  className = "",
  hint,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) {
        const j = (await res.json()) as { error?: string };
        throw new Error(j.error ?? "Upload failed");
      }
      const { url } = (await res.json()) as { url: string };
      onChange(url);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function onPickChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const hasValue = Boolean(value);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="mb-1.5 block text-xs font-semibold text-[var(--brand-navy)]">
          {label}
        </label>
      )}

      {/* Drop zone / preview */}
      <div
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="relative rounded-lg border-2 border-dashed border-border bg-slate-50 transition hover:border-[var(--brand-green)]/50"
      >
        {hasValue && preview === "image" ? (
          <div className="relative">
            <img
              src={value}
              alt="preview"
              className="h-40 w-full rounded-lg object-cover"
              onError={(e) => { (e.target as HTMLImageElement).src = ""; }}
            />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : hasValue && preview === "video" ? (
          <div className="relative">
            <video src={value} controls className="h-40 w-full rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
            {preview === "video" ? (
              <Video className="h-8 w-8 text-muted-foreground/40" />
            ) : (
              <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
            )}
            <p className="text-xs text-muted-foreground">Drag & drop or choose a file</p>
          </div>
        )}

        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--brand-green)]" />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-1.5 rounded border border-border bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-navy)] hover:border-[var(--brand-green)] transition disabled:opacity-50"
        >
          <Upload className="h-3.5 w-3.5" />
          {uploading ? "Uploading…" : "Upload File"}
        </button>
        {hasValue && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="inline-flex items-center gap-1.5 rounded border border-border bg-white px-3 py-1.5 text-xs font-semibold text-red-500 hover:border-red-400 transition"
          >
            <X className="h-3.5 w-3.5" /> Remove
          </button>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onPickChange}
      />
    </div>
  );
}
