function CollapsibleSection({ title, children }) {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="collapsible-section">
      <div className="collapsible-header" onClick={toggleOpen}>
        <strong>{title}</strong>
        <span className="collapsible-toggle">{isOpen ? '−' : '+'}</span>
      </div>
      {isOpen && (
        <div className="collapsible-content">
          {children}
        </div>
      )}
    </div>
  );
}