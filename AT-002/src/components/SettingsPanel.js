function SettingsPanel({ storyData, onUpdateWorldMeta, onUpdatePlayer, onAddItemToInventory, onRemoveItemFromInventory }) {
  const [isAddingItem, setIsAddingItem] = React.useState(false);
  const [itemToAdd, setItemToAdd] = React.useState('');

  if (!storyData) return <p>Loading settings...</p>;

  const allNodes = Object.entries(storyData.nodes);
  const allEntities = Object.entries(storyData.entities);
  const startingInventory = storyData.player.inventory || [];

  const handleSaveItem = () => {
    if (itemToAdd) {
      onAddItemToInventory(itemToAdd);
    }
    setIsAddingItem(false);
    setItemToAdd('');
  };

  return (
    <div>
      <CollapsibleSection title="World Info">
        <div style={{ marginBottom: '10px' }}>
          <strong>World Name:</strong>
          <input type="text" value={storyData.world_meta.name} onChange={(e) => onUpdateWorldMeta('name', e.target.value)} style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px' }} />
        </div>
        <div>
          <strong>Description:</strong>
          <textarea value={storyData.world_meta.description} onChange={(e) => onUpdateWorldMeta('description', e.target.value)} rows="3" style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px' }} />
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Player Settings">
        <div style={{ marginBottom: '15px' }}>
          <strong>Starting Node:</strong>
          <select value={storyData.player.starting_location} onChange={(e) => onUpdatePlayer('starting_location', e.target.value)} style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px' }}>
            {allNodes.map(([id, node]) => <option key={id} value={id}>{node.name}</option>)}
          </select>
        </div>
        <div>
          <strong>Starting Inventory:</strong>
          <div style={{marginTop: '5px'}}>
            {startingInventory.map((entityId, index) => (
              <div key={index} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
                <span>{storyData.templates[storyData.entities[entityId]?.template]?.name || entityId}</span>
                <button onClick={() => onRemoveItemFromInventory(index)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px'}}>x</button>
              </div>
            ))}
          </div>

          {!isAddingItem ? (
            <button onClick={() => setIsAddingItem(true)} style={{marginTop: '5px'}}>+ Add Item</button>
          ) : (
            <div style={{background: '#3a3a3a', padding: '10px', borderRadius: '4px', margin: '10px 0'}}>
              <select value={itemToAdd} onChange={(e) => setItemToAdd(e.target.value)} style={{width: '100%', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}>
                <option value="">-- Select Entity to Add --</option>
                {allEntities.map(([id, entity]) => {
                  const template = storyData.templates[entity.template];
                  return <option key={id} value={id}>{template?.name || id} ({id})</option>
                })}
              </select>
              <div style={{marginTop: '10px'}}>
                <button onClick={handleSaveItem} style={{marginRight: '5px', background: '#4a6a4a'}}>Save</button>
                <button onClick={() => setIsAddingItem(false)} style={{background: '#666'}}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </CollapsibleSection>
    </div>
  );
}