// The app is a catalog, not a wizard. There is no gate and no stage machine:
// the router owns navigation, <KitProvider> owns the (optional) kit, and every
// page reads the kit as a lens. Compare with the old 660-line stage machine.
import { useEffect, useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import { KitProvider } from './kit/KitContext.jsx';
import { CurtainProvider } from './components/Curtain.jsx';
import SiteHeader from './components/SiteHeader.jsx';
import SiteFooter from './components/SiteFooter.jsx';
import SearchOverlay from './components/SearchOverlay.jsx';
import CatalogPage from './routes/CatalogPage.jsx';
import ProjectPage from './routes/ProjectPage.jsx';
import KitPage from './routes/KitPage.jsx';
import NotFoundPage from './routes/NotFoundPage.jsx';

// Router keeps the scroll position on navigation; a catalog wants the top —
// unless the destination names an anchor (e.g. "/#catalog" from the kit's
// "see what you can build"), in which case we land on that section instead.
function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const target = document.querySelector(hash);
      if (target) {
        const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname, hash]);
  return null;
}

function App() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <KitProvider>
      <CurtainProvider>
        <ScrollToTop />
        <a className="skip-link" href="#main">
          Skip to content
        </a>

        <SiteHeader onOpenSearch={() => setSearchOpen(true)} />

        <main id="main">
          <Routes>
            <Route path="/" element={<CatalogPage />} />
            <Route path="/p/:id" element={<ProjectPage />} />
            <Route path="/kit" element={<KitPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>

        <SiteFooter />

        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </CurtainProvider>
    </KitProvider>
  );
}

export default App;
