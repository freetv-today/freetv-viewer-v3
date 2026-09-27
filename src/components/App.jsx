import { Router, Route } from 'preact-iso';
import { useContext, useEffect } from 'preact/hooks';
import { PlaylistContext } from '@/context/PlaylistContext';
import { SpinnerLoadingAppData } from '@components/Loaders/SpinnerLoadingAppData';
import { handleKeyPress } from '@/utils';
import { LayoutDefault } from '@components/Layouts/LayoutDefault';
import { LayoutSubnav } from '@components/Layouts/LayoutSubnav';
import { LayoutFullpage } from '@components/Layouts/LayoutFullpage';
import { LayoutSearch } from '@components/Layouts/LayoutSearch';
import { LayoutVidviewer } from '@components/Layouts/LayoutVidviewer';
import { Home } from '@pages/Home';
import { Recent } from '@pages/Recent';
import { Search } from '@pages/Search';
import { Favorites } from '@pages/Favorites';
import { Help } from '@pages/Help';
import { Category } from '@pages/Category';
import { NowPlaying } from '@pages/NowPlaying';
import { ShowToastAlert } from '@components/UI/ToastAlerts';
import { PWAInstallPrompt } from '@components/UI/PWAInstallPrompt';
import { V4PreviewBanner } from '@components/UI/V4PreviewBanner';
import { NotFound } from '@pages/_404';
import '@/style.css';

// Predefined route components:
const HomeRoute = () => <LayoutDefault><Home /></LayoutDefault>;
const RecentRoute = () => <LayoutSubnav><Recent /></LayoutSubnav>;
const CategoryRoute = () => <LayoutSubnav><Category /></LayoutSubnav>;
const SearchRoute = () => <LayoutSearch><Search /></LayoutSearch>;
const FavoritesRoute = () => <LayoutSubnav><Favorites /></LayoutSubnav>;
const HelpRoute = () => <LayoutFullpage><Help /></LayoutFullpage>;
const NowPlayingRoute = () => <LayoutVidviewer><NowPlaying /></LayoutVidviewer>;
const NotFoundRoute = () => <LayoutFullpage><NotFound /></LayoutFullpage>;

export function App() {

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    // Initialize Bootstrap toasts globally
    // @ts-ignore
    const bootstrap = window.bootstrap;
    if (bootstrap && document.body) {
      const toastElList = [].slice.call(document.querySelectorAll('.toast'));
      toastElList.forEach(function (toastEl) {
        if (!toastEl.toastInstance) {
          toastEl.toastInstance = new bootstrap.Toast(toastEl, {});
        }
      });
    }
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const ctx = useContext(PlaylistContext);
  const { playlistSwitching } = ctx;

  // Render spinner during playlist switching
  if (playlistSwitching) {
    return <LayoutFullpage><SpinnerLoadingAppData /></LayoutFullpage>;
  }

  // Render the app when not switching playlists
  return (
    <main>
      <V4PreviewBanner />
      <PWAInstallPrompt />
      <Router>
        <Route path="/" component={HomeRoute} exact />
        <Route path="/recent" component={RecentRoute} />
        <Route path="/category/:name" component={CategoryRoute} />
        <Route path="/search" component={SearchRoute} />
        <Route path="/favorites" component={FavoritesRoute} />
        <Route path="/help" component={HelpRoute} />
        <Route path="/nowplaying" component={NowPlayingRoute} />
        <Route default component={NotFoundRoute} />
      </Router>
      <ShowToastAlert />
    </main>
  );
}