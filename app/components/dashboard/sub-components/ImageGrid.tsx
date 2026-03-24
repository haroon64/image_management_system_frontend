// ImageGrid.tsx

import { useState, useEffect, useCallback } from "react";

interface Image {
    id: number;
    image: string | { url: string };
    filename?: string;
    timestamp?: string;
    created_at?: string;
}

interface Toast {
    msg: string;
    type: "success" | "error";
}

function formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
}

export default function ImageGrid({ refreshKey = 0 }): JSX.Element {
    const [images, setImages] = useState<Image[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [fetchError, setFetchError] = useState<string>("");
    const [lightbox, setLightbox] = useState<Image | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<Image | null>(null);
    const [deleting, setDeleting] = useState<boolean>(false);
    const [toast, setToast] = useState<Toast | null>(null);

    const showToast = (msg: string, type: "success" | "error" = "success"): void => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    
    const fetchImages = useCallback(async (): Promise<void> => {
        setLoading(true);
        setFetchError("");
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/`);
            if (!res.ok) throw new Error(`Failed to load images (${res.status})`);
            const data: Image[] = await res.json();
            setImages(data);
        } catch (err) {
            setFetchError(err instanceof Error ? err.message : "Could not load images.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchImages();
    }, [fetchImages, refreshKey]);

    
    const confirmDelete = async (): Promise<void> => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/images/delete/${deleteTarget.id}/`
            , { method: "DELETE" });
            if (!res.ok && res.status !== 204) throw new Error(`Delete failed (${res.status})`);
            setImages((prev) => prev.filter((i) => i.id !== deleteTarget.id));
            showToast(`Image deleted`);
        } catch (err) {
            showToast(err instanceof Error ? err.message : "Delete failed.", "error");
        } finally {
            setDeleting(false);
            setDeleteTarget(null);
        }
    };

   
    const renderSkeleton = (): JSX.Element[] =>
        Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="ig-skeleton" style={{ animationDelay: `${i * 80}ms` }} />
        ));

    const renderEmpty = (): JSX.Element => (
        <div className="ig-empty">
            <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="6" y="6" width="52" height="52" rx="4" />
                <path d="M6 44l14-14 10 10 8-8 14 12" strokeLinecap="round" strokeLinejoin="round" opacity=".4" />
                <circle cx="22" cy="22" r="5" opacity=".4" />
            </svg>
            <h3>No images yet</h3>
            <p>Upload your first image using the panel on the left</p>
        </div>
    );

    
    return (
        <>
            <style>{gridStyles}</style>

            <section className="ig-card">
                <div className="ig-header">
                    <div>
                        <span className="ig-eyebrow">Library</span>
                        <h2 className="ig-title">Image Gallery</h2>
                    </div>
                    <div className="ig-header-right">
                        {!loading && !fetchError && (
                            <span className="ig-count">{images.length} file{images.length !== 1 ? "s" : ""}</span>
                        )}
                        <button className="ig-refresh-btn" onClick={fetchImages} title="Refresh" disabled={loading}>
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 14 14"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                style={{ animation: loading ? "ig-spin 1s linear infinite" : "none" }}
                            >
                                <path d="M12 7A5 5 0 1 1 7 2a5 5 0 0 1 3.54 1.46L13 1" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M13 1v4H9" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Fetch error */}
                {fetchError && (
                    <div className="ig-fetch-error">
                        <span>⚠ {fetchError}</span>
                        <button onClick={fetchImages}>Retry</button>
                    </div>
                )}

                {/* Grid */}
                <div className="ig-grid">
                    {loading
                        ? renderSkeleton()
                        : images.length === 0 && !fetchError
                            ? renderEmpty()
                            : images.map((img, idx) => (
                                    <div key={img.id} className="ig-item" style={{ animationDelay: `${idx * 50}ms` }}>
                                        <img
                                            src={typeof img.image === "string" ? img.image : img.image?.url}
                                            alt={img.filename || `Image ${img.id}`}
                                            className="ig-img"
                                            loading="lazy"
                                        />
                                        <div className="ig-overlay">
                                            <button
                                                className="ig-overlay-btn ig-btn-view"
                                                onClick={() => setLightbox(img)}
                                                title="View"
                                            >
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                    <circle cx="6.5" cy="6.5" r="4.5" />
                                                    <path d="M10 10l3.5 3.5" strokeLinecap="round" />
                                                </svg>
                                            </button>
                                            <button
                                                className="ig-overlay-btn ig-btn-del"
                                                onClick={() => setDeleteTarget(img)}
                                                title="Delete"
                                            >
                                                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6">
                                                    <path d="M2 4h11M6 4V2h3v2M4.5 4l1 9h5l1-9" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                        <div className="ig-meta">
                                            <span className="ig-fname">{img.filename || `image-${img.id}`}</span>
                                            <span className="ig-date">{formatDate(img.timestamp || img.created_at || "")}</span>
                                        </div>
                                    </div>
                                ))}
                </div>
            </section>

            {/* Lightbox */}
            {lightbox && (
                <div className="ig-modal-bg" onClick={() => setLightbox(null)}>
                    <div className="ig-lightbox" onClick={(e) => e.stopPropagation()}>
                        <button className="ig-lb-close" onClick={() => setLightbox(null)}>
                            ×
                        </button>
                        <img
                            src={typeof lightbox.image === "string" ? lightbox.image : lightbox.image?.url}
                            alt={lightbox.filename || "preview"}
                            className="ig-lb-img"
                        />
                        <div className="ig-lb-footer">
                            <span>{lightbox.filename || `image-${lightbox.id}`}</span>
                            <span>{formatDate(lightbox.timestamp || lightbox.created_at || "")}</span>
                        </div>
                    </div>
                </div>
            )}

            
            {deleteTarget && (
                <div className="ig-modal-bg" onClick={() => !deleting && setDeleteTarget(null)}>
                    <div className="ig-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>Delete Image?</h3>
                        <p>
                            Permanently delete <strong>{deleteTarget.filename || `image-${deleteTarget.id}`}</strong>?
                            This cannot be undone.
                        </p>
                        <div className="ig-dialog-btns">
                            <button className="ig-d-cancel" onClick={() => setDeleteTarget(null)} disabled={deleting}>
                                Cancel
                            </button>
                            <button className="ig-d-confirm" onClick={confirmDelete} disabled={deleting}>
                                {deleting ? "Deleting…" : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            
            {toast && <div className={`ig-toast ig-toast-${toast.type}`}>{toast.msg}</div>}
        </>
    );
}


const gridStyles = `
    @keyframes ig-spin { to { transform: rotate(360deg); } }
    @keyframes ig-fade-up { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
    @keyframes ig-pulse { 0%,100% { opacity:.45; } 50% { opacity:.9; } }

    .ig-card {
        background: #ffffff;
        border: 1px solid var(--vi-border);
        border-radius: var(--vi-radius);
        padding: 32px 28px 28px;
        display: flex; flex-direction: column; gap: 24px;
        min-height: 500px;
    }

    .ig-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .ig-eyebrow { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: var(--vi-muted); display: block; margin-bottom: 2px; }
    .ig-title { font-family: 'Fraunces', serif; font-size: 26px; font-weight: 700; color: var(--vi-ink); line-height: 1; }
    .ig-header-right { display: flex; align-items: center; gap: 12px; }
    .ig-count { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: var(--vi-muted); }
    .ig-refresh-btn {
        width: 30px; height: 30px; background: var(--vi-paper); border: 1px solid var(--vi-border);
        border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center;
        transition: border-color .15s, background .15s;
    }
    .ig-refresh-btn:hover { border-color: var(--vi-ink); background: var(--vi-ink); color: #fff; }
    .ig-refresh-btn:disabled { opacity: .5; cursor: default; }

    .ig-fetch-error {
        background: #fff2f0; border: 1px solid #ffc5bb; border-radius: var(--vi-radius);
        padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;
        font-size: 11px; color: var(--vi-accent);
    }
    .ig-fetch-error button {
        font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
        background: var(--vi-accent); color: #fff; border: none;
        padding: 5px 12px; border-radius: var(--vi-radius); cursor: pointer;
    }

    .ig-grid { columns: 3; column-gap: 14px; }
    @media (max-width: 1100px) { .ig-grid { columns: 2; } }
    @media (max-width: 600px)  { .ig-grid { columns: 1; } }

    .ig-item {
        break-inside: avoid; margin-bottom: 14px;
        border: 1px solid var(--vi-border); border-radius: var(--vi-radius);
        overflow: hidden; position: relative;
        transition: box-shadow .2s, transform .2s;
        animation: ig-fade-up .35s ease both;
        background: var(--vi-paper);
    }
    .ig-item:hover { box-shadow: 0 4px 18px rgba(15,14,12,.1); transform: translateY(-2px); }
    .ig-item:hover .ig-overlay { opacity: 1; }

    .ig-img { width: 100%; display: block; }

    .ig-overlay {
        position: absolute; inset: 0;
        background: rgba(15,14,12,.52);
        opacity: 0; transition: opacity .2s;
        display: flex; align-items: center; justify-content: center; gap: 10px;
    }
    .ig-overlay-btn {
        width: 38px; height: 38px; border-radius: 50%; border: none; cursor: pointer;
        display: flex; align-items: center; justify-content: center; transition: transform .15s;
    }
    .ig-overlay-btn:hover { transform: scale(1.12); }
    .ig-btn-view { background: #f5f2ec; color: var(--vi-ink); }
    .ig-btn-del  { background: var(--vi-accent); color: #fff; }

    .ig-meta { padding: 9px 12px; border-top: 1px solid var(--vi-border); background: #fff; }
    .ig-fname { display: block; font-size: 11px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-bottom: 2px; }
    .ig-date  { font-size: 10px; color: var(--vi-muted); }

    .ig-skeleton {
        break-inside: avoid; margin-bottom: 14px;
        border-radius: var(--vi-radius);
        background: linear-gradient(90deg, var(--vi-paper) 25%, var(--vi-border) 50%, var(--vi-paper) 75%);
        background-size: 200% 100%;
        animation: ig-pulse 1.4s ease-in-out infinite;
        height: 180px;
    }
    .ig-skeleton:nth-child(even) { height: 240px; }

    .ig-empty { text-align: center; padding: 60px 0; color: var(--vi-border); }
    .ig-empty svg { margin: 0 auto 18px; }
    .ig-empty h3 { font-family: 'Fraunces', serif; font-size: 24px; font-weight: 300; font-style: italic; margin-bottom: 6px; color: var(--vi-border); }
    .ig-empty p { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--vi-muted); }

    .ig-modal-bg {
        position: fixed; inset: 0; z-index: 200;
        background: rgba(15,14,12,.82); backdrop-filter: blur(4px);
        display: flex; align-items: center; justify-content: center; padding: 24px;
        animation: ig-fade-up .15s ease;
    }

    .ig-lightbox { position: relative; max-width: 88vw; max-height: 88vh; }
    .ig-lb-img { max-width: 100%; max-height: 78vh; display: block; border-radius: var(--vi-radius); }
    .ig-lb-footer {
        background: var(--vi-ink); color: #f5f2ec;
        padding: 12px 16px; display: flex; justify-content: space-between;
        border-radius: 0 0 var(--vi-radius) var(--vi-radius);
        font-size: 11px; letter-spacing: .5px;
    }
    .ig-lb-close {
        position: absolute; top: -13px; right: -13px;
        width: 30px; height: 30px; border-radius: 50%;
        background: var(--vi-accent); color: #fff; border: none; cursor: pointer;
        font-size: 18px; display: flex; align-items: center; justify-content: center;
        line-height: 1; transition: transform .15s;
    }
    .ig-lb-close:hover { transform: scale(1.12); }

    .ig-dialog {
        background: #fff; border: 2px solid var(--vi-ink);
        border-radius: var(--vi-radius); padding: 32px 28px; max-width: 380px; width: 100%;
    }
    .ig-dialog h3 { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 700; margin-bottom: 10px; }
    .ig-dialog p { font-size: 12px; color: var(--vi-muted); line-height: 1.65; margin-bottom: 24px; }
    .ig-dialog p strong { color: var(--vi-ink); }
    .ig-dialog-btns { display: flex; gap: 10px; }
    .ig-dialog-btns button {
        flex: 1; padding: 11px;
        font-family: 'DM Mono', monospace; font-size: 10px;
        letter-spacing: 2px; text-transform: uppercase;
        border-radius: var(--vi-radius); cursor: pointer; border: none; transition: all .15s;
    }
    .ig-d-cancel  { background: var(--vi-paper); border: 1px solid var(--vi-border) !important; color: var(--vi-ink); }
    .ig-d-cancel:hover  { background: var(--vi-border); }
    .ig-d-confirm { background: var(--vi-accent); color: #fff; }
    .ig-d-confirm:hover { background: #a33208; }
    .ig-dialog-btns button:disabled { opacity: .5; cursor: not-allowed; }

    .ig-toast {
        position: fixed; bottom: 28px; right: 28px; z-index: 300;
        padding: 13px 20px; border-radius: var(--vi-radius);
        font-family: 'DM Mono', monospace; font-size: 11px; letter-spacing: .5px;
        box-shadow: 0 4px 20px rgba(0,0,0,.16);
        animation: ig-fade-up .25s ease;
    }
    .ig-toast-success { background: #1a4a2e; color: #d4f0e0; }
    .ig-toast-error   { background: var(--vi-accent); color: #fff; }
`;