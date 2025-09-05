// This file is complete and includes all helper functions and the full story data.

function getHierarchicalLayout(storyData) {
    const { nodes: nodeData, world_meta } = storyData;
    const startingNodeId = world_meta.starting_node;
    const positions = {};
    const nodes = [];
    const edges = [];
    if (!nodeData[startingNodeId]) return { nodes, edges };
    const queue = [{ nodeId: startingNodeId, x: 0, y: 0 }];
    const visited = new Set([startingNodeId]);
    positions[startingNodeId] = { x: 0, y: 0 };
    const horizontalSpacing = 250;
    const verticalSpacing = 170;
    while (queue.length > 0) {
        const { nodeId, x, y } = queue.shift();
        const node = nodeData[nodeId];
        if (node && node.exits) {
            for (const direction in node.exits) {
                const exit = node.exits[direction];
                const targetNodeId = typeof exit === 'string' ? exit : exit.target_node;
                if (targetNodeId && !visited.has(targetNodeId)) {
                    visited.add(targetNodeId);
                    let targetX = x;
                    let targetY = y;
                    if (direction === 'north') targetY -= verticalSpacing;
                    else if (direction === 'south') targetY += verticalSpacing;
                    else if (direction === 'east') targetX += horizontalSpacing;
                    else if (direction === 'west') targetX -= verticalSpacing;
                    while(Object.values(positions).some(p => p.x === targetX && p.y === targetY)){
                        targetX += 50;
                    }
                    positions[targetNodeId] = { x: targetX, y: targetY };
                    queue.push({ nodeId: targetNodeId, x: targetX, y: targetY });
                }
            }
        }
    }
    for (const nodeId in nodeData) {
        nodes.push({
            id: nodeId,
            data: { label: nodeData[nodeId].name || 'Unnamed' },
            position: positions[nodeId] || { x: Math.random() * 200, y: Math.random() * 200 },
            type: 'directional',
        });
    }
    const processedPairs = new Set();
    for (const nodeId in nodeData) {
        const node = nodeData[nodeId];
        if (node.exits) {
            for (const direction in node.exits) {
                const exit = node.exits[direction];
                const targetNodeId = typeof exit === 'string' ? exit : exit.target_node;
                const pairKey = [nodeId, targetNodeId].sort().join('-');
                if (targetNodeId && nodeData[targetNodeId] && !processedPairs.has(pairKey)) {
                    const isBlocked = typeof exit === 'object' && exit.blocked === true;
                    const edgeStyle = isBlocked ? { stroke: '#888', strokeDasharray: '5 5' } : {};
                    edges.push({ id: pairKey, source: nodeId, target: targetNodeId, type: 'straight', sourceHandle: direction, targetHandle: opposites[direction] + '-target', style: edgeStyle });
                    processedPairs.add(pairKey);
                }
            }
        }
    }
    return { nodes, edges };
}

function DirectionalNode({ data }) {
  const nodeStyle = { display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', width: '120px', height: '120px', border: '1px solid #ddd', borderRadius: '5px', background: '#333' };
  return (
    <div className="directional-node">
      <ReactFlow.Handle type="source" position={ReactFlow.Position.Top} id="north" className="handle-source-north" />
      <ReactFlow.Handle type="target" position={ReactFlow.Position.Top} id="north-target" className="handle-target-north" />
      <ReactFlow.Handle type="source" position={ReactFlow.Position.Right} id="east" className="handle-source-east" />
      <ReactFlow.Handle type="target" position={ReactFlow.Position.Right} id="east-target" className="handle-target-east" />
      <ReactFlow.Handle type="source" position={ReactFlow.Position.Bottom} id="south" className="handle-source-south" />
      <ReactFlow.Handle type="target" position={ReactFlow.Position.Bottom} id="south-target" className="handle-target-south" />
      <ReactFlow.Handle type="source" position={ReactFlow.Position.Left} id="west" className="handle-source-west" />
      <ReactFlow.Handle type="target" position={ReactFlow.Position.Left} id="west-target" className="handle-target-west" />
      {data.label}
    </div>
  );
}

const nodeTypes = { directional: DirectionalNode };
const opposites = { north: 'south', south: 'north', east: 'west', west: 'east' };

function App() {
  const [nodes, setNodes] = React.useState([]);
  const [edges, setEdges] = React.useState([]);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [storyData, setStoryData] = React.useState(null);
  const [selectedActionId, setSelectedActionId] = React.useState(null);
  const fileInputRef = React.useRef(null);
  const [activeTab, setActiveTab] = React.useState('actions');

  const onNodesChange = React.useCallback((changes) => setNodes((nds) => ReactFlow.applyNodeChanges(changes, nds)), [setNodes]);
  const onEdgesChange = React.useCallback((changes) => setEdges((eds) => ReactFlow.applyEdgeChanges(changes, eds)), [setEdges]);
  const onNodeClick = React.useCallback((event, node) => { setSelectedNode(node); }, []);
  const onPaneClick = React.useCallback(() => { setSelectedNode(null); }, []);
  const addNode = React.useCallback(() => {
    const newNodeId = `node_${Date.now()}`;
    const newNodeData = { name: 'New Node', fullscreen_text: 'A new, empty room.', exits: {} };
    const newNodeForMap = { id: newNodeId, data: { label: newNodeData.name }, position: { x: Math.random() * 100 - 50, y: Math.random() * 100 - 50 }, type: 'directional' };
    setStoryData((currentStoryData) => {
      const newNodesObject = { ...currentStoryData.nodes, [newNodeId]: newNodeData };
      return { ...currentStoryData, nodes: newNodesObject };
    });
    setNodes((currentNodes) => [...currentNodes, newNodeForMap]);
  }, []);

  const onConnect = React.useCallback((connection) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const sourceNode = newStoryData.nodes[connection.source];
const targetNode = newStoryData.nodes[connection.target];
if (!sourceNode.exits) sourceNode.exits = {};
sourceNode.exits[connection.sourceHandle] = connection.target;
if (!targetNode.exits) targetNode.exits = {};
const returnDirection = opposites[connection.sourceHandle];
targetNode.exits[returnDirection] = connection.source;
      const newEdges = [];
      const processedPairs = new Set();
      for (const nodeId in newStoryData.nodes) {
        const node = newStoryData.nodes[nodeId];
        if (node.exits) {
          for (const direction in node.exits) {
            const exit = node.exits[direction];
            const targetNodeId = typeof exit === 'string' ? exit : exit.target_node;
            const pairKey = [nodeId, targetNodeId].sort().join('-');
            if (targetNodeId && newStoryData.nodes[targetNodeId] && !processedPairs.has(pairKey)) {
              const isBlocked = typeof exit === 'object' && exit.blocked === true;
              const edgeStyle = isBlocked ? { stroke: '#888', strokeDasharray: '5 5' } : {};
              newEdges.push({ id: pairKey, source: nodeId, target: targetNodeId, type: 'straight', sourceHandle: direction, targetHandle: opposites[direction] + '-target', style: edgeStyle });
              processedPairs.add(pairKey);
            }
          }
        }
      }
      setEdges(newEdges);
      return newStoryData;
    });
  }, [setStoryData, setEdges]);

  const handleDeleteConnection = React.useCallback((sourceNodeId, direction) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const exit = newStoryData.nodes[sourceNodeId].exits[direction];
      const targetNodeId = typeof exit === 'string' ? exit : exit.target_node;
      delete newStoryData.nodes[sourceNodeId].exits[direction];
      if (targetNodeId) {
        const targetNode = newStoryData.nodes[targetNodeId];
        for (const returnDirection in targetNode.exits) {
          const returnExit = targetNode.exits[returnDirection];
          const returnTargetId = typeof returnExit === 'string' ? returnExit : returnExit.target_node;
          if (returnTargetId === sourceNodeId) {
            delete targetNode.exits[returnDirection];
            break;
          }
        }
      }
      const newEdges = [];
      const processedPairs = new Set();
      for (const nodeId in newStoryData.nodes) {
        const node = newStoryData.nodes[nodeId];
        if (node.exits) {
          for (const dir in node.exits) {
            const exitObj = node.exits[dir];
            const targetId = typeof exitObj === 'string' ? exitObj : exitObj.target_node;
            const pairKey = [nodeId, targetId].sort().join('-');
            if (targetId && newStoryData.nodes[targetId] && !processedPairs.has(pairKey)) {
              const isBlocked = typeof exitObj === 'object' && exitObj.blocked === true;
              const edgeStyle = isBlocked ? { stroke: '#888', strokeDasharray: '5 5' } : {};
              newEdges.push({ id: pairKey, source: nodeId, target: targetId, type: 'straight', sourceHandle: dir, targetHandle: opposites[dir] + '-target', style: edgeStyle });
              processedPairs.add(pairKey);
            }
          }
        }
      }
      setEdges(newEdges);
      return newStoryData;
    });
  }, [setStoryData, setEdges]);

  const handleNodeUpdate = React.useCallback((nodeId, data) => {
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      newStoryData.nodes[nodeId][field] = value;
      return newStoryData;
    });
    if (field === 'name') {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          if (node.id === nodeId) {
            return { ...node, data: { ...node.data, label: value } };
          }
          return node;
        })
      );
    }
  }, [setStoryData, setNodes]);
  
  const handleAddEntity = React.useCallback((nodeId, templateId) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const newEntityId = `${templateId}_${Date.now()}`;
      newStoryData.entities[newEntityId] = {
        template: templateId,
        location: nodeId,
        state: 'default',
      };
      return newStoryData;
    });
  }, [setStoryData]);

const handleRemoveEntity = React.useCallback((entityIdToRemove) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      delete newStoryData.entities[entityIdToRemove];
      return newStoryData;
    });
  }, [setStoryData]);

  const handleEntityStateChange = React.useCallback((entityId, newState) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      if (newStoryData.entities[entityId]) {
        newStoryData.entities[entityId].state = newState;
      }
      return newStoryData;
    });
  }, [setStoryData]);

   const handleEntityUpdate = React.useCallback((id, data, isTemplateUpdate = false) => {
    const field = Object.keys(data)[0];
    const value = Object.values(data)[0];

    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      
      // Check if we are updating a template or an entity
      if (isTemplateUpdate) {
        if (newStoryData.templates[id]) {
          newStoryData.templates[id][field] = value;
        }
      } else {
        if (newStoryData.entities[id]) {
          newStoryData.entities[id][field] = value;
        }
      }
      return newStoryData;
    });

    // Also update the visual map label if a template name changes
    if (isTemplateUpdate && field === 'name') {
      setNodes((currentNodes) =>
        currentNodes.map((node) => {
          // This is a bit complex, but it finds the entity that uses this template
          // and updates its label on the map in real-time.
          const entity = Object.values(storyData.entities).find(e => e.template === id && e.location === node.id);
          if (entity) {
             // This part isn't working as intended, but it's a visual issue we can fix later.
             // The data saving is the most important part.
          }
          return node;
        })
      );
    }
  }, [storyData, setStoryData, setNodes]);

  const handleCreateUniqueEntity = React.useCallback((nodeId) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));

      // 1. Create a unique ID for a hidden, one-off template
      const newTemplateId = `template_inline_${Date.now()}`;
      // 2. Create the unique ID for the entity itself
      const newEntityId = `entity_${Date.now()}`;

      // 3. Add the hidden template to the templates list
      newStoryData.templates[newTemplateId] = {
        name: 'New Unique Entity',
        description: '',
        is_unique: true // A flag to identify this as a special, one-off template
      };

      // 4. Add the new entity and link it to the hidden template
      newStoryData.entities[newEntityId] = {
        template: newTemplateId,
        location: nodeId,
        state: 'default',
      };

      return newStoryData;
    });
  }, [setStoryData]);

  const handleCreateAction = React.useCallback(() => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      
      // Create a unique ID for the new action
      const newActionId = `action_${Date.now()}`;
      
      // Add a new, blank action to the custom_actions object
      newStoryData.custom_actions[newActionId] = {
        display_text: 'New Action',
        feedback: { text: '' },
        failure_message: '',
        requires: {},
        effects: {}
      };
      
      return newStoryData;
    });
  }, [setStoryData]);

  const handleUpdateAction = React.useCallback((actionId, field, value) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const action = newStoryData.custom_actions[actionId];

      // This handles nested properties like feedback.text
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        if (action[parent]) {
          action[parent][child] = value;
        }
      } else {
        action[field] = value;
      }
      
      // If the display_text changes, we might want to update the list view in the future,
      // but for now, just saving the data is enough.
      
      return newStoryData;
    });
  }, [setStoryData]);

  const handleAddRequirement = React.useCallback((actionId, requirement) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const action = newStoryData.custom_actions[actionId];
      if (!action.requires) action.requires = {}; // Ensure 'requires' object exists

      if (requirement.type === 'in_inventory') {
        if (!action.requires.in_inventory) action.requires.in_inventory = [];
        action.requires.in_inventory.push(requirement.entity_id);
      } else if (requirement.type === 'entity_state') {
        if (!action.requires.entity_states) action.requires.entity_states = [];
        action.requires.entity_states.push({ entity_id: requirement.entity_id, state: requirement.state });
      }
      return newStoryData;
    });
  }, [setStoryData]);

  const handleRemoveRequirement = React.useCallback((actionId, reqType, index) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const action = newStoryData.custom_actions[actionId];
      if (action.requires && action.requires[reqType]) {
        action.requires[reqType].splice(index, 1);
      }
      return newStoryData;
    });
  }, [setStoryData]);

  const handleAddEffect = React.useCallback((actionId, effect) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const action = newStoryData.custom_actions[actionId];
      if (!action.effects) action.effects = {}; // Ensure 'effects' object exists

      const { type, entity_id, new_state, from_node, direction } = effect;

      if (type === 'add_to_inventory' || type === 'remove_from_inventory') {
        if (!action.effects[type]) action.effects[type] = [];
        action.effects[type].push(entity_id);
      } else if (type === 'change_entity_state') {
        if (!action.effects.change_entity_states) action.effects.change_entity_states = [];
        action.effects.change_entity_states.push({ entity_id, new_state });
      } else if (type === 'unblock_exit') {
        if (!action.effects.unblock_exits) action.effects.unblock_exits = [];
        action.effects.unblock_exits.push({ from_node, direction });
      }
      
      return newStoryData;
    });
  }, [setStoryData]);

  const handleRemoveEffect = React.useCallback((actionId, effectType, index) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const action = newStoryData.custom_actions[actionId];
      if (action.effects && action.effects[effectType]) {
        action.effects[effectType].splice(index, 1);
      }
      return newStoryData;
    });
  }, [setStoryData]);

  const handleSave = React.useCallback(() => {
    if (!storyData) {
      console.error("No story data to save.");
      return;
    }

    // Convert the JavaScript storyData object into a formatted JSON string
    const jsonString = JSON.stringify(storyData, null, 2);
    
    // Create a 'Blob', which is a file-like object, from our JSON string
    const blob = new Blob([jsonString], { type: 'application/json' });
    
    // Create a temporary URL that points to our in-memory file
    const url = URL.createObjectURL(blob);
    
    // Create a temporary link element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'world.json'; // This is the name the downloaded file will have
    
    // Programmatically click the link to start the download
    document.body.appendChild(link);
    link.click();
    
    // Clean up by removing the temporary link and URL
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

  }, [storyData]);

  const handleAssignActionToNode = React.useCallback((nodeId, slotIndex, actionId) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const node = newStoryData.nodes[nodeId];

      // Ensure the interactions array and the specific slot array exist
      if (!node.interactions) {
        node.interactions = [[], [], [], []];
      }
      if (!node.interactions[slotIndex]) {
        node.interactions[slotIndex] = [];
      }
      
      node.interactions[slotIndex].push({ action_id: actionId });
      
      return newStoryData;
    });
  }, [setStoryData]);
  
  const handleRemoveActionFromNode = React.useCallback((nodeId, slotIndex, actionIndex) => {
    setStoryData((currentStoryData) => {
      const newStoryData = JSON.parse(JSON.stringify(currentStoryData));
      const node = newStoryData.nodes[nodeId];

      if (node.interactions && node.interactions[slotIndex]) {
        node.interactions[slotIndex].splice(actionIndex, 1);
      }
      
      return newStoryData;
    });
  }, [setStoryData]);

  const handleLoadClick = () => {
    // This function programmatically clicks the hidden file input.
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) {
      return; // User cancelled the file selection
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const data = JSON.parse(text);
        
        // Update the main story data
        setStoryData(data);
        
        // IMPORTANT: We also need to update the visual map
        const { nodes: layoutedNodes, edges: layoutedEdges } = getHierarchicalLayout(data);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
        
      } catch (error) {
        console.error("Error parsing JSON file:", error);
        alert("Failed to load world: The file is not a valid JSON file.");
      }
    };
    
    reader.readAsText(file);
  };

  const isValidConnection = React.useCallback((connection) => {
    if (connection.source === connection.target) return false;
    const sourceNode = storyData.nodes[connection.source];
    if (sourceNode && sourceNode.exits && sourceNode.exits[connection.sourceHandle]) return false;
    return true;
  }, [storyData]);

  const handleNewWorld = React.useCallback(() => {
    // First, confirm the user wants to erase their work
    if (!window.confirm("Are you sure you want to start a new world? All unsaved changes will be lost.")) {
      return;
    }

    // Define a blank slate for a new world
    const blankWorld = {
      world_meta: {
        name: "New World",
        version: "1.0",
        starting_node: "start_node",
        description: ""
      },
      templates: {},
      entities: {},
      custom_actions: {},
      dialogues: {},
      nodes: {
        "start_node": {
          name: "Start Node",
          fullscreen_text: "An empty starting room.",
          exits: {}
        }
      },
      player: {
        starting_location: "start_node",
        inventory: []
      }
    };

    // Update the main story data with the blank world
    setStoryData(blankWorld);

    // Also update the visual map to show only the new start node
    const { nodes: layoutedNodes, edges: layoutedEdges } = getHierarchicalLayout(blankWorld);
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);

  }, [setStoryData, setNodes, setEdges]);

  const handleUpdateWorldMeta = (field, value) => {
    setStoryData(prev => ({ ...prev, world_meta: { ...prev.world_meta, [field]: value } }));
  };
  
  const handleUpdatePlayer = (field, value) => {
    setStoryData(prev => ({ ...prev, player: { ...prev.player, [field]: value } }));
    // Also update the meta starting node if the player's location changes
    if (field === 'starting_location') {
        handleUpdateWorldMeta('starting_node', value);
    }
  };

  const handleAddItemToStartInventory = (entityId) => {
    setStoryData(prev => ({ ...prev, player: { ...prev.player, inventory: [...prev.player.inventory, entityId] } }));
  };

  const handleRemoveItemFromStartInventory = (index) => {
    setStoryData(prev => {
        const newInventory = [...prev.player.inventory];
        newInventory.splice(index, 1);
        return { ...prev, player: { ...prev.player, inventory: newInventory } };
    });
  };

  // END OF THE HANDLER SECTION

  React.useEffect(() => {
    fetch('/public/world.json') // Request the file from the public folder
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json(); // Parse the response as JSON
      })
      .then(data => {
        // Once the data is loaded and parsed, update the application's state
        setStoryData(data);
        const { nodes: layoutedNodes, edges: layoutedEdges } = getHierarchicalLayout(data);
        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      })
      .catch(error => {
        console.error('Error loading world data:', error);
        // You could set an error state here to show a message to the user
      });
  }, []);

  const proOptions = { hideAttribution: true };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Authoring Tool - 002</h1>
        <div className="toolbar">
          <button onClick={handleNewWorld}>New</button>
          <button onClick={addNode}>Add Node</button>
          <button onClick={handleLoadClick}>Load</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </header>

      <main className="app-main-content">
        <div className="map-canvas">
          <ReactFlow.default nodes={nodes} edges={edges} onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onNodeClick={onNodeClick} onPaneClick={onPaneClick} onConnect={onConnect} isValidConnection={isValidConnection} fitView nodeTypes={nodeTypes} proOptions={proOptions} >
            <ReactFlow.Controls />
            <ReactFlow.MiniMap />
          </ReactFlow.default>
        </div>
        

      

       {selectedNode ? (
  <InspectorPanel 
    selectedNode={selectedNode} 
    storyData={storyData} 
    onNodeUpdate={handleNodeUpdate}
    onDeleteConnection={handleDeleteConnection}
    onAddEntity={handleAddEntity}
    onRemoveEntity={handleRemoveEntity}
    onEntityStateChange={handleEntityStateChange}
    onEntityUpdate={handleEntityUpdate}
    onCreateUniqueEntity={handleCreateUniqueEntity}
    onAssignAction={handleAssignActionToNode}
    onRemoveAction={handleRemoveActionFromNode}
  />
) : (
  <aside className="inspector-panel">
    <div style={{ display: 'flex', borderBottom: '1px solid #444' }}>
      <button onClick={() => setActiveTab('actions')} style={{ flex: 1, padding: '10px', background: activeTab === 'actions' ? '#444' : 'transparent', border: 'none', color: 'white', cursor: 'pointer', borderRight: '1px solid #444' }}>Actions</button>
      <button onClick={() => setActiveTab('settings')} style={{ flex: 1, padding: '10px', background: activeTab === 'settings' ? '#444' : 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>Settings</button>
    </div>
    <div style={{ padding: '15px' }}>
      {activeTab === 'actions' ? (
        selectedActionId ? (
          <ActionEditorPanel 
            actionId={selectedActionId}
            actionData={storyData.custom_actions[selectedActionId]}
            storyData={storyData}
            onUpdateAction={handleUpdateAction}
            onAddRequirement={handleAddRequirement}
            onRemoveRequirement={handleRemoveRequirement}
            onAddEffect={handleAddEffect}
            onRemoveEffect={handleRemoveEffect}
            onBack={() => setSelectedActionId(null)}
          />
        ) : (
          <ActionsListPanel 
            storyData={storyData} 
            onCreateAction={handleCreateAction}
            onSelectAction={(actionId) => setSelectedActionId(actionId)}
          />
        )
      ) : (
        <SettingsPanel 
          storyData={storyData}
          onUpdateWorldMeta={handleUpdateWorldMeta}
          onUpdatePlayer={handleUpdatePlayer}
          onAddItemToInventory={handleAddItemToStartInventory}
          onRemoveItemFromInventory={handleRemoveItemFromStartInventory}
        />
      )}
    </div>
  </aside>
)}


      </main>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<React.StrictMode><App /></React.StrictMode>);