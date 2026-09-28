import { useContext, useEffect } from 'preact/hooks';
import { PlaylistContext } from '@/context/PlaylistContext';
import { ButtonShowTitleNav } from '@components/Navigation/ButtonShowTitleNav';
import { AccordionGroupButtons } from '@components/UI/AccordionGroupButtons';
import { GlobalModalManager } from '@components/UI/GlobalModalManager';
import { useLocalStorage } from '@hooks/useLocalStorage';
import { useSignalEffect } from '@preact/signals';
import { favoritesSignal } from '@hooks/useFavoritesList';
import { useDebugLog } from '@/hooks/useDebugLog';
import { useModalManager } from '@/hooks/useModalManager';
import { capitalizeFirstLetter, getRandomCategory } from '@/utils';
import { useCategories } from '@/hooks/useCategories';

const titleCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

/**
 * ShowListSidebar - Main sidebar component displaying shows with grouping and modal support
 * @param {Object} props
 * @param {'category' | 'recent' | 'favorites'} props.context - Type of content to display
 * @param {string} [props.category] - Category name when context is 'category'
 * @returns {import('preact').JSX.Element}
 */

export function ShowListSidebar({ context, category }) {

  const log = useDebugLog();
  const { showData } = useContext(PlaylistContext);
  const [recentTitles] = useLocalStorage('recentTitles', { title: [] });
  const [favoritesList, setFavoritesList] = useLocalStorage('favoritesList', { title: [] });
  const categories = useCategories();
  const randomCategory = getRandomCategory(categories);
  const { activeModal, modalData, showModal, hideModal } = useModalManager();

  let shows = [];

  // Force rerender and sync favoritesList from localStorage when favoritesSignal changes (only for favorites context)
  useSignalEffect(() => {
    if (context === 'favorites') {
      favoritesSignal.value;
      // Always re-read the latest value from localStorage
      try {
        const item = window.localStorage.getItem('favoritesList');
        setFavoritesList(item ? JSON.parse(item) : { title: [] });
      } catch (err) {
        // fallback: do nothing
      }
    }
  });

  if (context === 'category' && category) {
    // Filter shows by category, sort alphabetically (ignoring "The")
    shows = showData?.filter(item => item.category.toLowerCase() === category.toLowerCase() && item.status === 'active') || [];
  } else if (context === 'recent') {
    shows = recentTitles.title
      .map(title => showData?.find(show => show.title === title))
      .filter(Boolean); // Remove any not found
  } else if (context === 'favorites') {
    shows = favoritesList.title
      .map(title => showData?.find(show => show.title === title))
      .filter(Boolean); // Remove any not found
  }

  // Group shows by their "group" field and separate individual shows
  const groupedShows = {};
  const individualShows = [];

  shows.forEach(show => {
    if (show.group) {
      if (!groupedShows[show.group]) {
        groupedShows[show.group] = [];
      }
      groupedShows[show.group].push(show);
    } else {
      individualShows.push(show);
    }
  });

  // Filter out groups with only 1 show (move them to individual shows)
  const validGroups = {};
  Object.keys(groupedShows).forEach(groupName => {
    if (groupedShows[groupName].length >= 2) {
      validGroups[groupName] = groupedShows[groupName];
    } else {
      // Move single-show groups to individual shows
      individualShows.push(...groupedShows[groupName]);
    }
  });

  // Sort individual shows alphabetically (ignoring "The")
  const sortedIndividualShows = individualShows.sort((a, b) => {
    const titleA = a.title.replace(/^The\s+/i, '');
    const titleB = b.title.replace(/^The\s+/i, '');
    return titleCollator.compare(titleA, titleB);
  });

  // Create sorted group entries for display (sort by group name, ignoring "The")
  const sortedGroups = Object.keys(validGroups).sort((a, b) => {
    const groupA = a.replace(/^The\s+/i, '');
    const groupB = b.replace(/^The\s+/i, '');
    return titleCollator.compare(groupA, groupB);
  });

  // Combine and sort all items (groups and individual shows) for final display order
  const allItems = [];
  
  // Add group entries
  sortedGroups.forEach(groupName => {
    allItems.push({
      type: 'group',
      name: groupName,
      shows: validGroups[groupName],
      sortKey: groupName.replace(/^The\s+/i, '')
    });
  });

  // Add individual show entries
  sortedIndividualShows.forEach(show => {
    allItems.push({
      type: 'show',
      show: show,
      sortKey: show.title.replace(/^The\s+/i, '')
    });
  });

  // Final sort of all items
  allItems.sort((a, b) => titleCollator.compare(a.sortKey, b.sortKey));
  if (category) {
    log(`Selected category: ${capitalizeFirstLetter(category)}`);
    log(`There are ${shows.length} titles in this category`);
    log(`Groups found: ${sortedGroups.length}, Individual shows: ${sortedIndividualShows.length}`);
  }
  
  return (
    <aside className="sidebar-fixed-width p-1 mb-1 mb-lg-0">
      {allItems.length > 0 ? (
        allItems.map((item, index) => {
          if (item.type === 'group') {
            return (
              <AccordionGroupButtons
                key={`group-${item.name}`}
                groupName={item.name}
                shows={item.shows}
                accordionId={`accordion-${item.name.replace(/[^\w\s]/g, '').replace(/\s+/g, '-').toLowerCase()}-${index}`}
                onShowModal={showModal}
              />
            );
          } else {
            return (
              <ButtonShowTitleNav
                key={item.show.identifier}
                title={item.show.title}
                category={item.show.category}
                identifier={item.show.identifier}
                desc={item.show.desc}
                start={item.show.start}
                end={item.show.end}
                imdb={item.show.imdb}
                onShowModal={showModal}
              />
            );
          }
        })
      ) : (
        <>
          <p className="text-center mt-3 text-danger fw-bold">
            {context === 'favorites'
              ? `You haven't added any shows to your Favorites yet`
              : context === 'recent'
                ? 'No recently watched shows available'
                : 'No shows available in this category'}
          </p>
          <p className="text-center">
            <img src="/assets/sadface.svg" alt="😢" width="40" />
          </p>
          <p className="text-center">
            <a
              href={randomCategory ? `/category/${randomCategory}` : '#'}
              className="small fw-bold link-dark link-offset-3 link-underline link-underline-opacity-50"
              title="Click to visit a random category"
              onClick={e => {
                if (!randomCategory) e.preventDefault();
              }}
            >
              Go watch some Free TV!
            </a>  
          </p>        
        </>

        
      )}
      
      {/* Global Modal Manager */}
      <GlobalModalManager 
        activeModal={activeModal} 
        modalData={modalData} 
        onClose={hideModal} 
      />
    </aside>
  );
}
