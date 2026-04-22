"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { createClient } from "@/libs/supabase/client";
import { toast } from "@/libs/toast";
import type { Messages } from "@/libs/i18n/getMessages";

// Image uploader for Viết Kudo (spec ihQ26W78P2 FR-010 + US5).
// Eagerly uploads selected files to the `kudo-images` Supabase Storage
// bucket; renders 80×80 thumbnails with signed-URL previews + × remove.
// Up to 5 × ≤ 5 MB each, MIME whitelist jpeg/png/webp.

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);

type UploadedImage = {
  path: string; // Storage path (persisted in kudo_images.url)
  signedUrl: string; // For thumbnail preview only (TTL 1h)
};

type ImageUploaderProps = {
  messages: Messages;
  /** Called when the list of uploaded images changes — parent plumbs
   *  `paths` into `createKudo`. */
  onChange: (paths: string[]) => void;
  /** Called when the upload state changes — parent uses this to gate
   *  the Gửi button (`!isUploading`). */
  onUploadingChange: (isUploading: boolean) => void;
};

export function ImageUploader({ messages, onChange, onUploadingChange }: ImageUploaderProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    onChange(images.map((i) => i.path));
  }, [images, onChange]);

  useEffect(() => {
    onUploadingChange(isUploading);
  }, [isUploading, onUploadingChange]);

  const atCap = images.length >= MAX_FILES;

  const handleSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files ?? []);
      // Reset input so selecting the same file twice still fires onChange.
      e.target.value = "";
      if (files.length === 0) return;

      // Size / MIME validation — reject BEFORE calling Storage.
      for (const file of files) {
        if (!ALLOWED_MIME.has(file.type)) {
          toast({ message: messages.compose.validation.imageMimeInvalid, role: "alert" });
          return;
        }
        if (file.size > MAX_BYTES) {
          toast({ message: messages.compose.validation.imageTooLarge, role: "alert" });
          return;
        }
      }

      // Cap — silently truncate to remaining slots.
      const remaining = MAX_FILES - images.length;
      const toUpload = files.slice(0, remaining);

      setIsUploading(true);
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          toast({ message: messages.compose.toasts.imageUploadError, role: "alert" });
          return;
        }

        const uploaded: UploadedImage[] = [];
        for (const file of toUpload) {
          const ext = file.name.split(".").pop() ?? file.type.split("/").pop() ?? "bin";
          const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
          const { error: uploadErr } = await supabase.storage
            .from("kudo-images")
            .upload(path, file, { upsert: false, contentType: file.type });
          if (uploadErr) {
            console.error("[compose] storage upload failed:", uploadErr);
            toast({
              message: messages.compose.toasts.imageUploadError,
              role: "alert",
            });
            continue;
          }
          const { data: signedData, error: signErr } = await supabase.storage
            .from("kudo-images")
            .createSignedUrl(path, 3600);
          if (signErr || !signedData) {
            console.error("[compose] createSignedUrl failed:", signErr);
            // Best-effort — still add the path so the kudo write captures it.
            uploaded.push({ path, signedUrl: "" });
            continue;
          }
          uploaded.push({ path, signedUrl: signedData.signedUrl });
        }
        setImages((prev) => [...prev, ...uploaded]);
      } finally {
        setIsUploading(false);
      }
    },
    [images.length, messages],
  );

  const handleRemove = useCallback(async (path: string) => {
    setImages((prev) => prev.filter((i) => i.path !== path));
    // Best-effort Storage delete — RLS owner-only.
    try {
      const supabase = createClient();
      await supabase.storage.from("kudo-images").remove([path]);
    } catch (err) {
      console.error("[compose] storage remove failed:", err);
    }
  }, []);

  return (
    <div className="flex items-center gap-4 max-sm:flex-col max-sm:items-start">
      <label
        htmlFor="kudo-image-input"
        className="flex w-[146px] items-center gap-0.5 text-[22px] leading-7 font-bold text-[var(--color-brand-900)] font-[family-name:var(--font-montserrat)] max-sm:w-auto"
      >
        {messages.compose.fields.image.label}
      </label>
      <div className="flex flex-1 flex-wrap items-center gap-4">
        {images.map((img) => (
          <div key={img.path} className="relative h-20 w-20">
            {img.signedUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={img.signedUrl}
                alt=""
                className="h-full w-full rounded-[12px] border-2 border-[var(--color-accent-cream)] object-cover"
              />
            )}
            <button
              type="button"
              onClick={() => handleRemove(img.path)}
              aria-label="Remove image"
              className="absolute -right-2 -top-2 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--color-close-red)] text-white cursor-pointer hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)]"
            >
              <Icon name="close" size={14} />
            </button>
          </div>
        ))}

        {!atCap && (
          <>
            <input
              ref={fileInputRef}
              id="kudo-image-input"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={handleSelect}
              disabled={isUploading}
              className="sr-only"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              aria-label={messages.compose.fields.image.trigger}
              className="flex h-12 cursor-pointer flex-col items-center justify-center gap-0.5 rounded border border-[var(--color-border-secondary)] bg-white px-2 py-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--color-accent-cream)] focus-visible:outline-offset-2 hover:bg-[var(--color-accent-cream)]/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <div className="inline-flex items-center gap-1">
                <Icon name="plus" size={20} className="text-[var(--color-brand-900)]" />
                <span className="text-[11px] leading-4 font-bold tracking-[0.5px] text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]">
                  {messages.compose.fields.image.trigger}
                </span>
              </div>
              <span className="text-[11px] leading-4 font-bold tracking-[0.5px] text-[var(--color-muted-grey)] font-[family-name:var(--font-montserrat)]">
                {messages.compose.fields.image.max}
              </span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}
