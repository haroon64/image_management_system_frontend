// UploadImage.tsx
import { useState, useRef, FC, ChangeEvent, DragEvent } from "react";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_SIZE_MB = 10;

interface Preview {
    url: string;
    file: File;
}

interface UploadImageProps {
    onUploadSuccess?: (data: unknown) => void;
}

interface UploadResponse {
    detail?: string;
}

function validateFile(file: File): string | null {
    if (!ALLOWED_TYPES.includes(file.type))
        return `"${file.name}" — unsupported format. Use JPG, PNG, WEBP or GIF.`;
    if (file.size > MAX_SIZE_MB * 1024 * 1024)
        return `"${file.name}" — exceeds ${MAX_SIZE_MB} MB limit.`;
    return null;
}

const UploadImage: FC<UploadImageProps> = ({ onUploadSuccess }) => {
    const [dragging, setDragging] = useState<boolean>(false);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [error, setError] = useState<string>("");
    const [saving, setSaving] = useState<boolean>(false);
    const [progress, setProgress] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const selectFile = (file: File): void => {
        setError("");
        const err = validateFile(file);
        if (err) {
            setError(err);
            return;
        }
        setPreview({ url: URL.createObjectURL(file), file });
    };

    const onInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
        if (e.target.files?.[0]) selectFile(e.target.files[0]);
        e.target.value = "";
    };

    const onDrop = (e: DragEvent<HTMLDivElement>): void => {
        e.preventDefault();
        setDragging(false);
        if (e.dataTransfer.files?.[0]) selectFile(e.dataTransfer.files[0]);
    };

    const clearPreview = (): void => {
        if (preview) URL.revokeObjectURL(preview.url);
        setPreview(null);
        setError("");
    };

    const handleSave = async (): Promise<void> => {
        if (!preview) return;
        setSaving(true);
        setProgress(0);

        const tick = setInterval(() => {
            setProgress((p) => (p >= 85 ? p : p + Math.random() * 15));
        }, 150);

        try {
            const formData = new FormData();
            formData.append("image", preview.file);

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/`, {
                method: "POST",
                body: formData,
            });

            if (!res.ok) {
                const body = (await res.json().catch(() => ({}))) as UploadResponse;
                throw new Error(body.detail || `Server error ${res.status}`);
            }

            const data = (await res.json()) as unknown;
            clearInterval(tick);
            setProgress(100);

            setTimeout(() => {
                setSaving(false);
                setProgress(0);
                clearPreview();
                onUploadSuccess?.(data);
            }, 400);
        } catch (err) {
            clearInterval(tick);
            setSaving(false);
            setProgress(0);
            setError(err instanceof Error ? err.message : "Upload failed. Please try again.");
        }
    };

    return (
        <>
            <style>{uploadStyles}</style>

            <section className="up-card">
                <div className="up-header">
                    <span className="up-eyebrow">New Upload</span>
                    <h2 className="up-title">Add Image</h2>
                </div>

                {!preview ? (
                    <div
                        className={`up-zone${dragging ? " dragging" : ""}`}
                        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={onDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <svg className="up-zone-icon" viewBox="0 0 56 56" fill="none" stroke="currentColor" strokeWidth="1.4">
                            <rect x="4" y="4" width="48" height="48" rx="4" />
                            <path d="M28 36V20M20 28l8-8 8 8" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M4 40l12-12 9 9 7-7 12 10" strokeLinecap="round" strokeLinejoin="round" opacity=".35" />
                        </svg>
                        <p className="up-zone-label">{dragging ? "Release to select" : "Drag & drop an image"}</p>
                        <p className="up-zone-sub">or click to browse &nbsp;·&nbsp; JPG PNG WEBP GIF &nbsp;·&nbsp; max 10 MB</p>
                    </div>
                ) : (
                    <div className="up-preview">
                        <img src={preview.url} alt="preview" className="up-preview-img" />
                        <div className="up-preview-meta">
                            <span className="up-fname">{preview.file.name}</span>
                            <span className="up-fsize">{(preview.file.size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>
                        {!saving && (
                            <button className="up-clear-btn" title="Remove" onClick={clearPreview}>×</button>
                        )}
                    </div>
                )}

                {error && <p className="up-error">⚠ {error}</p>}

                {saving && (
                    <div className="up-progress-wrap">
                        <div className="up-progress-bar" style={{ width: `${progress}%` }} />
                        <span className="up-progress-label">Saving… {Math.round(progress)}%</span>
                    </div>
                )}

                <button
                    className={`up-save-btn${!preview || saving ? " disabled" : ""}`}
                    onClick={handleSave}
                    disabled={!preview || saving}
                >
                    {saving ? "Saving…" : "Save Image"}
                    {!saving && (
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M2 7h10M8 3l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </button>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={onInputChange}
                />
            </section>
        </>
    );
};

export default UploadImage;


const uploadStyles = `
  .up-card {
    background: #ffffff;
    border: 1px solid var(--vi-border);
    border-radius: var(--vi-radius);
    padding: 32px 28px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    position: relative;
  }
  .up-header { display: flex; flex-direction: column; gap: 2px; }
  .up-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--vi-muted); }
  .up-title { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: var(--vi-ink); line-height: 1; }

  .up-zone {
    border: 2px dashed var(--vi-border);
    border-radius: var(--vi-radius);
    padding: 40px 24px;
    text-align: center;
    cursor: pointer;
    transition: border-color .2s, background .2s, transform .15s;
  }
  .up-zone:hover, .up-zone.dragging {
    border-color: var(--vi-accent);
    background: #fff8f5;
    transform: scale(1.005);
  }
  .up-zone-icon { width: 52px; height: 52px; margin: 0 auto 14px; color: var(--vi-border); }
  .up-zone-label { font-family: 'Fraunces', serif; font-size: 17px; font-weight: 600; color: var(--vi-ink); margin-bottom: 6px; }
  .up-zone-sub { font-size: 10px; letter-spacing: 1.2px; text-transform: uppercase; color: var(--vi-muted); }

  .up-preview {
    position: relative;
    border-radius: var(--vi-radius);
    overflow: hidden;
    border: 1px solid var(--vi-border);
  }
  .up-preview-img { width: 100%; max-height: 240px; object-fit: cover; display: block; }
  .up-preview-meta {
    display: flex; justify-content: space-between; align-items: center;
    padding: 10px 14px;
    background: var(--vi-ink);
  }
  .up-fname { font-size: 11px; color: #f5f2ec; letter-spacing: .5px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 70%; }
  .up-fsize { font-size: 10px; color: var(--vi-muted2); }
  .up-clear-btn {
    position: absolute; top: 8px; right: 8px;
    width: 28px; height: 28px; border-radius: 50%;
    background: var(--vi-accent); color: #fff;
    border: none; cursor: pointer; font-size: 18px;
    display: flex; align-items: center; justify-content: center;
    line-height: 1; transition: transform .15s;
  }
  .up-clear-btn:hover { transform: scale(1.12); }

  .up-error {
    font-size: 11px; color: var(--vi-accent);
    background: #fff2f0; border: 1px solid #ffc5bb;
    border-radius: var(--vi-radius); padding: 10px 14px;
    letter-spacing: .4px;
  }

  .up-progress-wrap {
    height: 3px; background: var(--vi-border);
    border-radius: 99px; overflow: hidden; position: relative;
  }
  .up-progress-bar {
    position: absolute; top: 0; left: 0; height: 100%;
    background: var(--vi-accent); border-radius: 99px;
    transition: width .12s linear;
  }
  .up-progress-label {
    display: block; margin-top: 6px;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
    color: var(--vi-muted);
  }

  .up-save-btn {
    display: flex; align-items: center; justify-content: center; gap: 8px;
    width: 100%; padding: 13px;
    background: var(--vi-ink); color: var(--vi-paper);
    border: none; border-radius: var(--vi-radius); cursor: pointer;
    font-family: 'DM Mono', monospace; font-size: 11px;
    letter-spacing: 2.5px; text-transform: uppercase;
    transition: background .15s, opacity .15s;
  }
  .up-save-btn:hover:not(.disabled) { background: var(--vi-accent); }
  .up-save-btn.disabled { opacity: .45; cursor: not-allowed; }
`;