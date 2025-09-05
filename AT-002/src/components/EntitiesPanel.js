function EntitiesPanel({ selectedNode, storyData, onAddEntity, onRemoveEntity, onEntityStateChange, onEntityUpdate, onCreateUniqueEntity }) {
  const [selectedTemplate, setSelectedTemplate] = React.useState('');
  const entitiesInRoom = Object.entries(storyData.entities)
    .filter(([id, entity]) => entity.location === selectedNode.id)
    .map(([id, entity]) => ({ ...entity, id }));

  const templateOptions = Object.entries(storyData.templates).filter(([id, t]) => !t.is_unique);

  const handleAddClick = () => {
    if (selectedTemplate) {
      onAddEntity(selectedNode.id, selectedTemplate);
      setSelectedTemplate('');
    }
  };

  const handleUniqueClick = () => {
    onCreateUniqueEntity(selectedNode.id);
  };
  
  // This function handles updating both name and description for unique entities
  const handleEntityTemplateUpdate = (templateId, data) => {
    // This is a bit of a trick: we re-use the node update logic for our templates
    // In the future, we would make a dedicated `handleTemplateUpdate` function
    onEntityUpdate(templateId, data, true); 
  }

  return (
    <div>
      <strong>Entities in this Room:</strong>
      {entitiesInRoom.length > 0 ? (
        <div style={{ marginTop: '5px' }}>
          {entitiesInRoom.map((entity) => {
            const template = storyData.templates[entity.template];
            const isUnique = template.is_unique;

            return (
              <div key={entity.id} style={{ border: '1px solid #444', borderRadius: '4px', padding: '10px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  {isUnique ? (
                    <input 
                      type="text" 
                      value={template.name}
                      onChange={(e) => onEntityUpdate(entity.template, { name: e.target.value }, true)}
                      style={{ fontWeight: 'bold', background: '#3a3a3a', color: '#fff', border: 'none', width: '70%' }}
                    />
                  ) : (
                    <strong>{template.name}</strong>
                  )}
                  <button onClick={() => onRemoveEntity(entity.id)} style={{ background: '#553333', color: '#ffaaaa', border: '1px solid #884444', borderRadius: '3px', cursor: 'pointer', padding: '2px 8px' }} title="Remove Entity" > x </button>
                </div>
                <textarea placeholder={isUnique ? "Unique description..." : `Default: "${template.description}"`} value={entity.description || ''} onChange={(e) => onEntityUpdate(entity.id, { description: e.target.value })} rows="2" style={{ width: '100%', marginTop: '5px', background: '#222', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px', fontFamily: 'sans-serif' }}/>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '5px' }}>
                  <label style={{fontSize: '0.8em', color: '#999'}}>State:</label>
                  <input type="text" value={entity.state} onChange={(e) => onEntityStateChange(entity.id, e.target.value)} style={{ width: '100px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '2px 5px', textAlign: 'center' }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : ( <p style={{ marginTop: '5px', color: '#888', fontStyle: 'italic' }}> No entities. </p> )}
      
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between', gap: '10px' }}>
        <select value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} style={{ flexGrow: 1, background: '#444', color: '#fff', border: '1px solid #666', padding: '5px' }}>
          <option value="">-- Add from template --</option>
          {templateOptions.map(([templateId, template]) => ( <option key={templateId} value={templateId}>{template.name}</option> ))}
        </select>
        <button onClick={handleAddClick} disabled={!selectedTemplate} style={{ padding: '5px' }}> Add </button>
      </div>
      <button onClick={handleUniqueClick} style={{width: '100%', marginTop: '10px', padding: '8px', background: '#3a4a3a', border: '1px solid #4a6a4a', color: '#afcaaf' }}>
        Create Unique Entity
      </button>
    </div>
  );
}