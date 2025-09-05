function InspectorPanel({ selectedNode, storyData, onNodeUpdate, onDeleteConnection, onAddEntity, onRemoveEntity, onEntityStateChange, onEntityUpdate, onCreateUniqueEntity, onAssignAction, onRemoveAction }) {
  // State to manage which "Add Action" dropdown is open
  const [addingToSlot, setAddingToSlot] = React.useState(null);
  const [actionToAssign, setActionToAssign] = React.useState('');

  if (!selectedNode || !storyData) {
    return (
      <aside className="inspector-panel">
        <h2 className="placeholder-text">Inspector</h2>
        <p className="placeholder-text">Click a node to see its details here.</p>
      </aside>
    );
  }

  const nodeDetails = storyData.nodes[selectedNode.id];
  if (!nodeDetails) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    onNodeUpdate(selectedNode.id, { [name]: value });
  };
  
  const handleAddActionClick = (slotIndex) => {
    setActionToAssign(''); // Reset selection
    setAddingToSlot(slotIndex);
  };
  
  const handleSaveActionAssignment = () => {
    if (actionToAssign) {
      onAssignAction(selectedNode.id, addingToSlot, actionToAssign);
    }
    setAddingToSlot(null); // Close the form
  };

  const exits = nodeDetails.exits || {};
  const exitEntries = Object.entries(exits);
  const allActions = Object.entries(storyData.custom_actions);
  const buttonLabels = ["Up Button (Slot 1)", "Down Button (Slot 2)", "Left Button (Slot 3)", "Right Button (Slot 4)"];

  return (
    <aside className="inspector-panel">
      <h2>Inspector</h2>
      <CollapsibleSection title="Info">
        <div style={{ marginBottom: '15px' }}>
          <strong>Name:</strong>
          <input type="text" name="name" value={nodeDetails.name} onChange={handleChange} style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Description:</strong>
          <textarea name="fullscreen_text" value={nodeDetails.fullscreen_text} onChange={handleChange} rows="6" style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px', fontFamily: 'sans-serif' }} />
        </div>
      </CollapsibleSection>
      
      <CollapsibleSection title="Connections">
        {exitEntries.length > 0 ? (
          <ul style={{ listStyle: 'none', paddingLeft: '0', marginTop: '0' }}>
            {exitEntries.map(([direction, targetNodeIdObj]) => {
              const targetNodeId = typeof targetNodeIdObj === 'string' ? targetNodeIdObj : targetNodeIdObj.target_node;
              const targetNodeName = storyData.nodes[targetNodeId]?.name || '...';
              return (
                <li key={direction} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '5px' }}>
                  <span> <strong style={{ textTransform: 'capitalize', color: '#88aaff' }}>{direction}</strong> → {targetNodeName} </span>
                  <button onClick={() => onDeleteConnection(selectedNode.id, direction)} style={{ background: '#553333', color: '#ffaaaa', border: '1px solid #884444', borderRadius: '3px', cursor: 'pointer', marginLeft: '10px', padding: '2px 8px' }} title="Delete Connection" > x </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <p style={{ marginTop: '0', color: '#888', fontStyle: 'italic' }}> No connections. </p>
        )}
      </CollapsibleSection>

      <CollapsibleSection title="Entities in this Room">
        <EntitiesPanel 
          selectedNode={selectedNode}
          storyData={storyData}
          onAddEntity={onAddEntity}
          onRemoveEntity={onRemoveEntity}
          onEntityStateChange={onEntityStateChange}
          onEntityUpdate={onEntityUpdate}
          onCreateUniqueEntity={onCreateUniqueEntity}
        />
      </CollapsibleSection>

      <CollapsibleSection title="Interactions (Buttons)">
        {buttonLabels.map((label, slotIndex) => {
          const assignedActions = nodeDetails.interactions?.[slotIndex] || [];
          return (
            <div key={slotIndex} style={{ borderTop: '1px solid #444', paddingTop: '10px', marginTop: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{label}</strong>
                <button onClick={() => handleAddActionClick(slotIndex)} disabled={addingToSlot !== null}>+ Add Action</button>
              </div>

              {addingToSlot === slotIndex && (
                <div style={{ background: '#3a3a3a', padding: '10px', borderRadius: '4px', margin: '10px 0' }}>
                  <select value={actionToAssign} onChange={(e) => setActionToAssign(e.target.value)} style={{ width: '100%', padding: '5px', background: '#555', color: 'white', border: '1px solid #666' }}>
                    <option value="">-- Select Action --</option>
                    {allActions.map(([id, action]) => <option key={id} value={id}>{action.display_text || id}</option>)}
                  </select>
                  <div style={{ marginTop: '10px' }}>
                    <button onClick={handleSaveActionAssignment} style={{ marginRight: '5px', background: '#4a6a4a' }}>Save</button>
                    <button onClick={() => setAddingToSlot(null)} style={{ background: '#666' }}>Cancel</button>
                  </div>
                </div>
              )}
              
              <div style={{marginTop: '10px'}}>
                {assignedActions.length > 0 ? (
                  assignedActions.map((interaction, actionIndex) => (
                    <div key={actionIndex} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
                      <span>{storyData.custom_actions[interaction.action_id]?.display_text || interaction.action_id}</span>
                      <button onClick={() => onRemoveAction(selectedNode.id, slotIndex, actionIndex)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>x</button>
                    </div>
                  ))
                ) : (
                  <p style={{color: '#888', margin: '5px 0', fontStyle: 'italic'}}>No actions assigned.</p>
                )}
              </div>
            </div>
          );
        })}
      </CollapsibleSection>
    </aside>
  );
}