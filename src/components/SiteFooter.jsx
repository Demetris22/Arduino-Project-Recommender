const REPO = 'https://github.com/Demetris22/Arduino-Project-Recommender';

function SiteFooter() {
  return (
    <footer className="sitefooter">
      <div className="shell sitefooter__in">
        <p>
          <span className="sitefooter__brand">Sketchef</span> is an Arduino project catalog, built by{' '}
          <a href="https://github.com/Demetris22" target="_blank" rel="noreferrer noopener">
            Demetris Demetriou
          </a>
          .
        </p>
        <p>
          <a href={REPO} target="_blank" rel="noreferrer noopener">
            View source ↗
          </a>
        </p>
      </div>
    </footer>
  );
}

export default SiteFooter;
