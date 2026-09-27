import { useState } from 'preact/hooks';

const DISMISS_KEY = 'freetv-v4-preview-banner-dismissed';

export function V4PreviewBanner() {
  const [visible, setVisible] = useState(() => localStorage.getItem(DISMISS_KEY) !== 'true');

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, 'true');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <aside
      style={{
        alignItems: 'center',
        background: 'gold',
        color: '#000',
        display: 'flex',
        justifyContent: 'center',
        minHeight: '25px',
        padding: '6px 36px',
        position: 'relative',
        textAlign: 'center',
        fontSize: '14px',
        lineHeight: '18px',
      }}
    >
      <a
        href="https://freetv.today/v4/"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          window.location.assign(event.currentTarget.href);
        }}
        style={{ color: 'inherit', fontWeight: 600 }}
      >
        Try the new FreeTV Viewer! (v4.0.0-beta)
      </a>
      <button
        type="button"
        aria-label="Dismiss v4 preview banner"
        onClick={dismiss}
        style={{
          background: 'transparent',
          border: 0,
          color: 'inherit',
          cursor: 'pointer',
          fontSize: '22px',
          lineHeight: 1,
          padding: '2px 8px',
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      >
        ×
      </button>
    </aside>
  );
}
