import { ButtonShowTitleNav } from '@components/Navigation/ButtonShowTitleNav';

const titleCollator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

/**
 * AccordionGroupButtons - Creates a Bootstrap accordion for grouped shows
 * @param {Object} props
 * @param {string} props.groupName - The name of the group (accordion title)
 * @param {Array} props.shows - Array of show objects in this group
 * @param {string} props.accordionId - Unique ID for this accordion
 * @param {function(string, any): void} [props.onShowModal] - Callback to show modal (type, data)
 * @returns {import('preact').JSX.Element}
 */

export function AccordionGroupButtons({ groupName, shows, accordionId, onShowModal }) {
  
  if (!shows || shows.length < 2) {
    return null; // Don't render accordion for less than 2 shows
  }

  // Sort shows within the group alphabetically (ignoring "The")
  const sortedShows = shows.sort((a, b) => {
    const titleA = a.title.replace(/^The\s+/i, '');
    const titleB = b.title.replace(/^The\s+/i, '');
    return titleCollator.compare(titleA, titleB);
  });

  const collapseId = `collapse-${accordionId}`;

  return (
    <div className="accordion mb-1 sidebar-accordion" id={accordionId}>
      <div className="accordion-item">
        <h2 className="accordion-header">
          <button 
            className="accordion-button collapsed sidebar-accordion-button" 
            type="button" 
            data-bs-toggle="collapse" 
            data-bs-target={`#${collapseId}`} 
            aria-expanded="false" 
            aria-controls={collapseId}
          >
            <span className="accordion-title">{groupName}</span>
          </button>
        </h2>
        <div 
          id={collapseId} 
          className="accordion-collapse collapse" 
          data-bs-parent={`#${accordionId}`}
        >
          <div className="accordion-body">
            {sortedShows.map(show => (
              <div key={show.identifier} className="accordion-button-wrapper">
                <ButtonShowTitleNav
                  title={show.title}
                  category={show.category}
                  identifier={show.identifier}
                  desc={show.desc}
                  start={show.start}
                  end={show.end}
                  imdb={show.imdb}
                  onShowModal={onShowModal}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
