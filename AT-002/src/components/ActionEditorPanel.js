function ActionEditorPanel({ actionId, actionData, storyData, onUpdateAction, onAddRequirement, onRemoveRequirement, onAddEffect, onRemoveEffect, onBack }) {
  // State for managing the "Add Requirement" form
  const [showAddReqForm, setShowAddReqForm] = React.useState(false);
  const [reqType, setReqType] = React.useState('in_inventory');
  const [reqEntityId, setReqEntityId] = React.useState('');
  const [reqState, setReqState] = React.useState('');

  // State for managing the "Add Effect" form
  const [showAddEffectForm, setShowAddEffectForm] = React.useState(false);
  const [effectType, setEffectType] = React.useState('add_to_inventory');
  const [effectEntityId, setEffectEntityId] = React.useState('');
  const [effectNewState, setEffectNewState] = React.useState('');
  const [effectNodeId, setEffectNodeId] = React.useState('');
  const [effectDirection, setEffectDirection] = React.useState('north');

  // Safety check in case data is not ready
  if (!actionData || !storyData) {
    return (
      <aside className="inspector-panel">
        <button onClick={onBack}>← Back to List</button>
        <p>Loading action data...</p>
      </aside>
    );
  }

  // Generic handler for text input changes
  const handleChange = (e) => {
    onUpdateAction(actionId, e.target.name, e.target.value);
  };

  // Handler to save a new requirement
  const handleSaveRequirement = () => {
    if (!reqEntityId) return; // Don't save if no entity is selected
    const newRequirement = {
      type: reqType,
      entity_id: reqEntityId,
      state: reqState,
    };
    onAddRequirement(actionId, newRequirement);
    // Reset form
    setShowAddReqForm(false);
    setReqEntityId('');
    setReqState('');
  };
  
  // Handler to save a new effect
  const handleSaveEffect = () => {
    const newEffect = { 
      type: effectType, 
      entity_id: effectEntityId, 
      new_state: effectNewState, 
      from_node: effectNodeId, 
      direction: effectDirection 
    };
    onAddEffect(actionId, newEffect);
    // Reset form
    setShowAddEffectForm(false);
    setEffectEntityId('');
    setEffectNewState('');
    setEffectNodeId('');
  };

  // Get lists of requirements and effects for easy display
  const inventoryReqs = actionData.requires?.in_inventory || [];
  const entityStateReqs = actionData.requires?.entity_states || [];
  const addInvEffects = actionData.effects?.add_to_inventory || [];
  const remInvEffects = actionData.effects?.remove_from_inventory || [];
  const changeStateEffects = actionData.effects?.change_entity_states || [];
  const unblockExitEffects = actionData.effects?.unblock_exits || [];
  
  // Get all entities and nodes to populate dropdowns
  const allEntities = Object.entries(storyData.entities);
  const allNodes = Object.entries(storyData.nodes);

  return (
    <aside className="inspector-panel">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h2>Edit Action</h2>
        <button onClick={onBack}>← Back to List</button>
      </div>
      
      {/* General Properties Form */}
      <div style={{marginTop: '20px'}}>
        <div style={{ marginBottom: '15px' }}>
          <strong>Display Text:</strong>
          <input type="text" name="display_text" value={actionData.display_text || ''} onChange={handleChange} style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Category:</strong>
          <input type="text" name="category" placeholder="e.g., Bridge Puzzles" value={actionData.category || ''} onChange={handleChange} style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Success Feedback:</strong>
          <textarea name="feedback.text" value={actionData.feedback?.text || ''} onChange={handleChange} rows="3" style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px', fontFamily: 'sans-serif' }} />
        </div>
        <div style={{ marginBottom: '15px' }}>
          <strong>Failure Message:</strong>
          <textarea name="failure_message" value={actionData.failure_message || ''} onChange={handleChange} rows="3" style={{ width: '100%', marginTop: '5px', background: '#444', color: '#fff', border: '1px solid #666', borderRadius: '3px', padding: '5px', fontFamily: 'sans-serif' }} />
        </div>
      </div>

      <hr style={{border: '1px solid #444'}}/>

      {/* Requirements Section */}
      <div style={{marginTop: '15px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3>Requirements (WHEN...)</h3>
          <button onClick={() => setShowAddReqForm(true)} disabled={showAddReqForm}>+ Add</button>
        </div>
        {showAddReqForm && (
          <div style={{background: '#3a3a3a', padding: '10px', borderRadius: '4px', margin: '10px 0'}}>
            <select value={reqType} onChange={(e) => setReqType(e.target.value)} style={{width: '100%', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}>
              <option value="in_inventory">Player has in inventory...</option>
              <option value="entity_state">Entity is in state...</option>
            </select>
            <select value={reqEntityId} onChange={(e) => setReqEntityId(e.target.value)} style={{width: '100%', marginTop: '5px', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}>
              <option value="">-- Select Entity --</option>
              {allEntities.map(([id, entity]) => {
                const template = storyData.templates[entity.template];
                return <option key={id} value={id}>{template?.name || id} ({id})</option>
              })}
            </select>
            {reqType === 'entity_state' && (
              <input type="text" placeholder="Required state (e.g., 'on')" value={reqState} onChange={(e) => setReqState(e.target.value)} style={{width: '100%', marginTop: '5px', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}/>
            )}
            <div style={{marginTop: '10px'}}>
              <button onClick={handleSaveRequirement} style={{marginRight: '5px', background: '#4a6a4a'}}>Save</button>
              <button onClick={() => setShowAddReqForm(false)} style={{background: '#666'}}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{marginTop: '10px'}}>
          {inventoryReqs.length === 0 && entityStateReqs.length === 0 && <p style={{color: '#888'}}>No requirements.</p>}
          {inventoryReqs.map((entityId, index) => (
            <div key={`inv-${index}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
              <span>Player has '{storyData.templates[storyData.entities[entityId]?.template]?.name || entityId}'</span>
              <button onClick={() => onRemoveRequirement(actionId, 'in_inventory', index)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>x</button>
            </div>
          ))}
          {entityStateReqs.map((req, index) => (
            <div key={`state-${index}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
              <span>'{storyData.templates[storyData.entities[req.entity_id]?.template]?.name || req.entity_id}' is state '{req.state}'</span>
              <button onClick={() => onRemoveRequirement(actionId, 'entity_states', index)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>x</button>
            </div>
          ))}
        </div>
      </div>

      <hr style={{border: '1px solid #444'}}/>

      {/* Effects Section */}
      <div style={{marginTop: '15px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3>Effects (THEN...)</h3>
          <button onClick={() => setShowAddEffectForm(true)} disabled={showAddEffectForm}>+ Add</button>
        </div>
        {showAddEffectForm && (
          <div style={{background: '#3a3a3a', padding: '10px', borderRadius: '4px', margin: '10px 0'}}>
            <select value={effectType} onChange={(e) => setEffectType(e.target.value)} style={{width: '100%', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}>
              <option value="add_to_inventory">Add to inventory</option>
              <option value="remove_from_inventory">Remove from inventory</option>
              <option value="change_entity_state">Change entity state</option>
              <option value="unblock_exit">Unblock exit</option>
            </select>
            {(effectType === 'add_to_inventory' || effectType === 'remove_from_inventory' || effectType === 'change_entity_state') && (
              <select value={effectEntityId} onChange={(e) => setEffectEntityId(e.target.value)} style={{width: '100%', marginTop: '5px', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}>
                <option value="">-- Select Entity --</option>
                {allEntities.map(([id, entity]) => {
                  const template = storyData.templates[entity.template];
                  return <option key={id} value={id}>{template?.name || id} ({id})</option>
                })}
              </select>
            )}
            {effectType === 'change_entity_state' && (
              <input type="text" placeholder="New state (e.g., 'off')" value={effectNewState} onChange={(e) => setEffectNewState(e.target.value)} style={{width: '100%', marginTop: '5px', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}/>
            )}
            {effectType === 'unblock_exit' && (
              <>
                <select value={effectNodeId} onChange={(e) => setEffectNodeId(e.target.value)} style={{width: '100%', marginTop: '5px', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}>
                  <option value="">-- Select Node --</option>
                  {allNodes.map(([id, node]) => <option key={id} value={id}>{node.name}</option>)}
                </select>
                <select value={effectDirection} onChange={(e) => setEffectDirection(e.target.value)} style={{width: '100%', marginTop: '5px', padding: '5px', background: '#555', color: 'white', border: '1px solid #666'}}>
                  <option value="north">North</option>
                  <option value="south">South</option>
                  <option value="east">East</option>
                  <option value="west">West</option>
                </select>
              </>
            )}
            <div style={{marginTop: '10px'}}>
              <button onClick={handleSaveEffect} style={{marginRight: '5px', background: '#4a6a4a'}}>Save</button>
              <button onClick={() => setShowAddEffectForm(false)} style={{background: '#666'}}>Cancel</button>
            </div>
          </div>
        )}
        <div style={{marginTop: '10px'}}>
          {(addInvEffects.length + remInvEffects.length + changeStateEffects.length + unblockExitEffects.length) === 0 && <p style={{color: '#888'}}>No effects.</p>}
          {addInvEffects.map((entityId, index) => (
            <div key={`add-${index}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
              <span>Add '{storyData.templates[storyData.entities[entityId]?.template]?.name || entityId}' to inventory</span>
              <button onClick={() => onRemoveEffect(actionId, 'add_to_inventory', index)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>x</button>
            </div>
          ))}
          {remInvEffects.map((entityId, index) => (
            <div key={`rem-${index}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
              <span>Remove '{storyData.templates[storyData.entities[entityId]?.template]?.name || entityId}' from inventory</span>
              <button onClick={() => onRemoveEffect(actionId, 'remove_from_inventory', index)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>x</button>
            </div>
          ))}
          {changeStateEffects.map((effect, index) => (
            <div key={`change-${index}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
              <span>Change '{storyData.templates[storyData.entities[effect.entity_id]?.template]?.name || effect.entity_id}' to state '{effect.new_state}'</span>
              <button onClick={() => onRemoveEffect(actionId, 'change_entity_states', index)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>x</button>
            </div>
          ))}
          {unblockExitEffects.map((effect, index) => (
            <div key={`unblock-${index}`} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2f2f2f', padding: '5px', borderRadius: '3px', marginBottom: '5px'}}>
              <span>Unblock exit '{effect.direction}' from '{storyData.nodes[effect.from_node]?.name || effect.from_node}'</span>
              <button onClick={() => onRemoveEffect(actionId, 'unblock_exits', index)} style={{background: '#553333', color: '#ffaaaa', border: 'none', borderRadius: '3px', cursor: 'pointer'}}>x</button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}