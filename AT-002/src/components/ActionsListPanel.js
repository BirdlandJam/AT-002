function ActionsListPanel({ storyData, onCreateAction, onSelectAction }) {
  const [searchTerm, setSearchTerm] = React.useState('');

  if (!storyData || !storyData.custom_actions) {
    return (
      <aside className="inspector-panel">
        <h2>Actions</h2>
        <p style={{color: '#888', fontStyle: 'italic'}}>Loading actions...</p>
      </aside>
    );
  }

  // Filter actions based on the search term
  const filteredActions = Object.entries(storyData.custom_actions).filter(([id, action]) => {
    const searchText = searchTerm.toLowerCase();
    const actionText = (action.display_text || id).toLowerCase();
    const categoryText = (action.category || '').toLowerCase();
    return actionText.includes(searchText) || categoryText.includes(searchText);
  });

  // Group the filtered actions by category
  const groupedActions = filteredActions.reduce((groups, [actionId, actionData]) => {
    const category = actionData.category || 'Uncategorized';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push([actionId, actionData]);
    return groups;
  }, {});

  return (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Actions</h2>
        <button onClick={onCreateAction}>Add New Action</button>
      </div>

      <input 
        type="text" 
        placeholder="Search actions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', marginTop: '10px', padding: '5px', background: '#222', color: '#fff', border: '1px solid #666' }}
      />
      
      <div style={{marginTop: '15px'}}>
        {Object.entries(groupedActions).map(([category, actions]) => (
  <CollapsibleSection key={category} title={category}>
    {actions.map(([actionId, actionData]) => (
      <div 
        key={actionId} 
        onClick={() => onSelectAction(actionId)}
        style={{
          padding: '5px',
          marginBottom: '5px',
          cursor: 'pointer'
        }}
      >
        <strong>{actionData.display_text || actionId}</strong>
      </div>
    ))}
  </CollapsibleSection>
))}
      </div>
    </div>
  );
}