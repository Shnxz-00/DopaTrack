import { createContext, type FormEvent, type ReactNode, useContext, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown, X } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useLocalState } from "@/lib/localState";
import { appendDailyNote, createObsidianUri, pickVaultDirectory, type VaultDirectory } from "@/lib/obsidian";

export type VaultMeta = { method: "browser" | "manual"; name: string };
type SiteContextValue = {
  openLogin: () => void;
  openVault: () => void;
  profileName: string;
  vaultMeta: VaultMeta | null;
  logToVault: (content: string) => Promise<{ ok: boolean; message: string }>;
};
const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [loginOpen, setLoginOpen] = useState(false);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [profileName, setProfileName] = useLocalState<string>("dopa:demo-profile", "");
  const [vaultMeta, setVaultMeta] = useLocalState<VaultMeta | null>("dopa:vault", null);
  const [directory, setDirectory] = useState<VaultDirectory | null>(null);

  useEffect(() => {
    if (!loginOpen && !vaultOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLoginOpen(false);
        setVaultOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [loginOpen, vaultOpen]);

  const context = useMemo<SiteContextValue>(() => ({
    openLogin: () => setLoginOpen(true),
    openVault: () => setVaultOpen(true),
    profileName,
    vaultMeta,
    async logToVault(content) {
      if (directory) {
        try {
          await appendDailyNote(directory, content);
          return { ok: true, message: `Added to ${directory.name}.` };
        } catch (error) {
          const message = error instanceof Error ? error.message : "The vault permission needs to be renewed.";
          return { ok: false, message };
        }
      }
      if (vaultMeta?.method === "manual" && vaultMeta.name) {
        window.location.assign(createObsidianUri(vaultMeta.name, content));
        return { ok: true, message: "Opening Obsidian. Finish the save in the Obsidian app." };
      }
      if (vaultMeta?.method === "browser") {
        return { ok: false, message: "For privacy, the folder handle is not kept after a refresh. Choose the vault folder again." };
      }
      return { ok: false, message: "Choose or configure a vault before logging to Obsidian." };
    },
  }), [profileName, vaultMeta, directory]);

  return (
    <SiteContext.Provider value={context}>
      {children}
      {loginOpen && (
        <LoginDialog
          initialName={profileName}
          onClose={() => setLoginOpen(false)}
          onSave={name => { setProfileName(name); setLoginOpen(false); }}
        />
      )}
      {vaultOpen && (
        <VaultDialog
          vaultMeta={vaultMeta}
          onClose={() => setVaultOpen(false)}
          onSaveManual={name => { setVaultMeta({ method: "manual", name }); setDirectory(null); }}
          onChooseDirectory={async () => {
            const result = await pickVaultDirectory();
            if (result.directory) {
              setDirectory(result.directory);
              setVaultMeta({ method: "browser", name: result.directory.name });
            }
            return result.message;
          }}
          onDisconnect={() => { setDirectory(null); setVaultMeta(null); }}
        />
      )}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error("useSite must be used inside SiteProvider");
  return value;
}

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <span className={`brand-lockup${compact ? " brand-lockup-compact" : ""}`}>
      <span className="brand-mark-wrap"><img className="brand-mark" src="/images/dopatrack-logo.png" alt="" /></span>
      <span className="brand-name">Dopa<span>Track</span></span>
    </span>
  );
}

export function SiteFrame({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const { openLogin, profileName } = useSite();
  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="page-wrap nav-inner">
          <Link href="/" className="brand-link" aria-label="DopaTrack home"><Brand /></Link>
          <nav className="main-nav" aria-label="Main navigation">
            <Link href="/menu" className={location === "/menu" ? "nav-link active" : "nav-link"} aria-current={location === "/menu" ? "page" : undefined}>Menu</Link>
            <Link href="/audit" className={location === "/audit" ? "nav-link active" : "nav-link"} aria-current={location === "/audit" ? "page" : undefined}>Dopamine Audit</Link>
          </nav>
          <button className="login-trigger" type="button" onClick={openLogin}>
            <span className="login-dot" aria-hidden="true" />{profileName ? `Hi, ${profileName}` : "Log in"}
          </button>
        </div>
      </header>
      <div className="site-main">{children}</div>
      <footer className="site-footer">
        <div className="page-wrap footer-inner">
          <Link href="/" className="footer-brand"><Brand compact /></Link>
          <p>Small pauses. More of your own life.</p>
          <nav aria-label="Footer navigation"><Link href="/menu">Menu</Link><Link href="/audit">Dopamine Audit</Link></nav>
          <span className="footer-note">Your notes stay on this device.</span>
        </div>
      </footer>
    </div>
  );
}

function Dialog({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusable = () => Array.from(dialog.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex='-1'])"));
    focusable()[0]?.focus();
    const keepFocusInside = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return;
      const controls = focusable();
      if (!controls.length) { event.preventDefault(); dialog.focus(); return; }
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", keepFocusInside);
    return () => { document.removeEventListener("keydown", keepFocusInside); previousFocus?.focus(); };
  }, []);
  return (
    <div className="dialog-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section ref={dialogRef} tabIndex={-1} className="dialog-card" role="dialog" aria-modal="true" aria-labelledby="dialog-title" aria-describedby="dialog-description">
        <button className="dialog-close" type="button" onClick={onClose} aria-label="Close dialog"><X size={18} /></button>
        <div className="dialog-mark"><img src="/images/dopatrack-logo.png" alt="" /></div>
        <span className="eyebrow">DopaTrack · a quiet corner</span>
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-description" className="dialog-description">{description}</p>
        {children}
      </section>
    </div>
  );
}

function LoginDialog({ initialName, onClose, onSave }: { initialName: string; onClose: () => void; onSave: (name: string) => void }) {
  const [name, setName] = useState(initialName);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSave(name.trim());
  };
  return (
    <Dialog title="Welcome, for now." description="This is a local demo profile—there is no account, password, or server sign-in. Your name stays in this browser." onClose={onClose}>
      <form className="dialog-form" onSubmit={submit}>
        <label htmlFor="demo-name">What should we call you? <span>Optional</span></label>
        <input id="demo-name" value={name} onChange={event => setName(event.target.value)} placeholder="A name you like" autoComplete="nickname" maxLength={32} />
        <button className="button button-primary button-full" type="submit">Continue locally <ArrowUpRight size={16} /></button>
        <button className="quiet-button button-full" type="button" onClick={onClose}>Not right now</button>
      </form>
    </Dialog>
  );
}

function VaultDialog({ vaultMeta, onClose, onSaveManual, onChooseDirectory, onDisconnect }: {
  vaultMeta: VaultMeta | null;
  onClose: () => void;
  onSaveManual: (name: string) => void;
  onChooseDirectory: () => Promise<string>;
  onDisconnect: () => void;
}) {
  const [name, setName] = useState(vaultMeta?.method === "manual" ? vaultMeta.name : "");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const canPickFolder = typeof window !== "undefined" && "showDirectoryPicker" in window;
  const chooseFolder = async () => {
    setBusy(true);
    try {
      setStatus(await onChooseDirectory());
    } finally {
      setBusy(false);
    }
  };
  return (
    <Dialog title="Connect your own vault." description="Only you can choose what to share. DopaTrack never uploads or scans a vault in the background." onClose={onClose}>
      <div className="vault-explainer">
        <span className="vault-check"><Check size={16} /></span>
        <p>On supported browsers, choose a folder explicitly. Your browser will ask permission before DopaTrack appends a daily check-in.</p>
      </div>
      {canPickFolder ? (
        <button className="button button-primary button-full" type="button" onClick={chooseFolder} disabled={busy}>
          {busy ? "Waiting for permission…" : vaultMeta?.method === "browser" ? "Choose folder again" : "Choose a vault folder"}
          <ArrowUpRight size={16} />
        </button>
      ) : (
        <p className="vault-unavailable">This browser does not offer direct folder access. Use the Obsidian app link below instead.</p>
      )}
      <div className="dialog-divider"><span>or use an Obsidian app link</span></div>
      <form className="dialog-form" onSubmit={event => { event.preventDefault(); if (name.trim()) { onSaveManual(name.trim()); setStatus(`“${name.trim()}” is saved on this device. The note opens in Obsidian when you log it.`); } }}>
        <label htmlFor="vault-name">Obsidian vault name <span>Stored only here</span></label>
        <input id="vault-name" value={name} onChange={event => setName(event.target.value)} placeholder="My vault" autoComplete="off" maxLength={80} />
        <button className="button button-secondary button-full" type="submit" disabled={!name.trim()}>Save vault name</button>
      </form>
      {status && <p className="dialog-status" role="status">{status}</p>}
      {vaultMeta && <button className="quiet-button vault-disconnect" type="button" onClick={() => { onDisconnect(); setName(""); setStatus("Vault connection removed from this device."); }}>Disconnect saved vault</button>}
      <p className="vault-privacy">A browser folder permission lasts only as long as your browser session. After a refresh, choose the folder again. A manual link asks Obsidian to open; you finish saving there.</p>
      <button className="dialog-done" type="button" onClick={onClose}>Done <ChevronDown size={14} /></button>
    </Dialog>
  );
}

export function VaultAction({ content, onStatus }: { content: string; onStatus?: (message: string) => void }) {
  const { logToVault, openVault, vaultMeta } = useSite();
  const act = async () => {
    if (!vaultMeta) { openVault(); return; }
    const result = await logToVault(content);
    onStatus?.(result.message);
    if (!result.ok && /folder again/i.test(result.message)) openVault();
  };
  return <button className="button button-outline" type="button" onClick={act}>{vaultMeta ? "Log to Obsidian" : "Connect a vault"}<ArrowUpRight size={15} /></button>;
}
