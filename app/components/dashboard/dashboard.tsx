
"use client";
import { useState } from "react";
import UploadImage from "./sub-components/uploadImage";
import ImageGrid   from "./sub-components/ImageGrid";

export default function Dashboard() {
  
  const [refreshKey, setRefreshKey] = useState(0);

  const handleUploadSuccess = (newImage:any) => {
    
    setRefreshKey((k) => k + 1);
  };

  return (
    <>
      <style>{globalStyles}</style>

      <div className="db-root">
       
        <div className="db-page-head">
          <div>
            <p className="db-page-sub">Welcome back</p>
            <h1 className="db-page-title">Image Manager</h1>
          </div>
          <div className="db-stats">
            <div className="db-stat">
              <span className="db-stat-label">Total Images</span>
              <span className="db-stat-val" id="db-total-count">—</span>
            </div>
            <div className="db-stat-div" />
            <div className="db-stat">
              <span className="db-stat-label">Last Upload</span>
              <span className="db-stat-val">Today</span>
            </div>
          </div>
        </div>

        
        <div className="db-layout">
          {/* LEFT — Upload panel */}
          <aside className="db-aside">
            <UploadImage onUploadSuccess={handleUploadSuccess} />
          </aside>

          {/* RIGHT — Gallery */}
          <main className="db-main">
            <ImageGrid refreshKey={refreshKey} />
          </main>
        </div>

        
        <footer className="db-footer">
          <span>ImageVault &copy; {new Date().getFullYear()}</span>
          <span>Built with Django + React</span>
        </footer>
      </div>
    </>
  );
}


const globalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;1,9..144,300&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --vi-ink:    #0f0e0c;
    --vi-paper:  #f5f2ec;
    --vi-cream:  #ede9e1;
    --vi-accent: #c8410a;
    --vi-muted:  #9b978f;
    --vi-muted2: #c5c1b8;
    --vi-border: #ddd9d1;
    --vi-radius: 4px;
  }

  body {
    background: var(--vi-paper);
    font-family: 'DM Mono', monospace;
    color: var(--vi-ink);
    min-height: 100vh;
  }

  /* ── Root wrapper ── */
  .db-root {
    min-height: 100vh;
    display: flex; flex-direction: column;
  }

  /* ── Top bar ── */
  .db-topbar {
    background: var(--vi-ink);
    color: var(--vi-paper);
    padding: 0 40px;
    height: 56px;
    display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .db-logo { display: flex; align-items: center; gap: 10px; }
  .db-logo-text {
    font-family: 'Fraunces', serif;
    font-size: 18px; font-weight: 700; letter-spacing: -.3px;
  }
  .db-logo-text em { font-style: italic; color: #e8956d; }
  .db-nav { display: flex; gap: 0; }
  .db-nav-item {
    font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    padding: 6px 16px; cursor: pointer; color: var(--vi-muted2);
    border-bottom: 2px solid transparent;
    transition: color .15s, border-color .15s;
  }
  .db-nav-item:hover { color: var(--vi-paper); }
  .db-nav-active { color: var(--vi-paper) !important; border-color: #e8956d !important; }

  /* ── Page heading ── */
  .db-page-head {
    display: flex; align-items: flex-end; justify-content: space-between;
    padding: 40px 40px 28px;
    border-bottom: 1px solid var(--vi-border);
  }
  .db-page-sub { font-size: 10px; letter-spacing: 2.5px; text-transform: uppercase; color: var(--vi-muted); margin-bottom: 4px; }
  .db-page-title { font-family: 'Fraunces', serif; font-size: 36px; font-weight: 700; letter-spacing: -1px; line-height: 1; }

  .db-stats { display: flex; align-items: center; gap: 24px; }
  .db-stat { text-align: right; }
  .db-stat-label { display: block; font-size: 9px; letter-spacing: 2px; text-transform: uppercase; color: var(--vi-muted); margin-bottom: 3px; }
  .db-stat-val { font-family: 'Fraunces', serif; font-size: 22px; font-weight: 600; }
  .db-stat-div { width: 1px; height: 36px; background: var(--vi-border); }

  /* ── Layout ── */
  .db-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 360px 1fr;
    gap: 28px;
    padding: 32px 40px;
    align-items: start;
  }
  @media (max-width: 900px) {
    .db-layout { grid-template-columns: 1fr; }
    .db-page-head { flex-direction: column; gap: 20px; align-items: flex-start; }
    .db-stats { align-self: stretch; }
  }

  .db-aside { position: sticky; top: 72px; }
  .db-main  { min-width: 0; }

  /* ── Footer ── */
  .db-footer {
    padding: 20px 40px;
    border-top: 1px solid var(--vi-border);
    display: flex; justify-content: space-between;
    font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--vi-muted);
  }
`;