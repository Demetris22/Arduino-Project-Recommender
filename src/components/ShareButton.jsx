// Copies the current URL (which encodes board + parts) to the clipboard,
// with a brief "Copied!" confirmation. On devices with the Web Share API
// and no clipboard access, it falls back to the native share sheet.
import { useState } from 'react';

function ShareButton() {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = window.location.href;

    // Primary path: copy to clipboard for a consistent confirmation.
    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1600);
        return;
      } catch {
        // fall through to Web Share
      }
    }

    // Fallback: native share sheet (mostly mobile).
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Arduino build list', url });
      } catch {
        // user dismissed or share failed — nothing more to do
      }
    }
  };

  return (
    <button type="button" className="share-btn" onClick={share}>
      <span aria-hidden="true">🔗</span>
      {copied ? 'Link copied!' : 'Share build'}
    </button>
  );
}

export default ShareButton;
