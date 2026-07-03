// Difficulty shown as a stamped gauge: three squares filled 1/2/3 for
// beginner/intermediate/advanced, plus the label. Reads like a level marker on
// a drawing rather than a generic pill. Shared by the project card and the
// detail modal so they stay consistent.
function DifficultyStamp({ level }) {
  return (
    <span className={`difficulty-stamp difficulty-stamp--${level}`}>
      <span className="difficulty-stamp__gauge" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
      {level}
    </span>
  );
}

export default DifficultyStamp;
