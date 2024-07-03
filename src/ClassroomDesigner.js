import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import { Button } from '@progress/kendo-react-buttons';
import { Input } from '@progress/kendo-react-inputs';
import '@progress/kendo-theme-default/dist/all.css';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import './ClassroomDesigner.css';

const GRID_COLS = 12; // Number of columns in the grid
const CELL_SIZE = 50; // Size of each cell in the grid

const ModuleTypes = {
  DESK: { name: 'Bureau', color: '#FFB3BA' },
  TABLE: { name: 'Table', color: '#BAFFC9' },
  BOARD: { name: 'Tableau', color: '#BAE1FF' },
  DOOR: { name: 'Porte', color: '#FFFFBA' },
  WINDOW: { name: 'Fenêtre', color: '#E6E6FA' },
  TEACHER_TABLE: { name: 'Table Professeur', color: '#FFD700' },
  TEACHER_ASSIGNED_TABLE: { name: 'Table Attitrée', color: '#FFA500' }
};

const ClassroomDesigner = () => {
  const [layout, setLayout] = useState([]);
  const [planName, setPlanName] = useState('');
  const [savedPlans, setSavedPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const gridContainerRef = useRef(null);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const plans = JSON.parse(localStorage.getItem('classroomPlans') || '[]');
    setSavedPlans(plans);
    
    const updateGridDimensions = () => {
      if (gridContainerRef.current) {
        const { width, height } = gridContainerRef.current.getBoundingClientRect();
        setGridDimensions({ width, height });
      }
    };

    updateGridDimensions();
    window.addEventListener('resize', updateGridDimensions);

    return () => window.removeEventListener('resize', updateGridDimensions);
  }, []);

  const generateUniqueKey = () => {
    return `n${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('moduleType');
    const clientX = e.clientX;
    const clientY = e.clientY;
    const gridRect = gridContainerRef.current.getBoundingClientRect();
    const newItem = {
      i: generateUniqueKey(),
      x: Math.floor((clientX - gridRect.left) / CELL_SIZE),
      y: Math.floor((clientY - gridRect.top) / CELL_SIZE),
      w: 2,
      h: 2,
      type: type,
    };
    setLayout(prevLayout => [...prevLayout, newItem]);
  };

  const handleDelete = (itemToDelete) => {
    setLayout(prevLayout => prevLayout.filter(item => item.i !== itemToDelete.i));
  };

  const savePlan = () => {
    if (!planName.trim()) {
      alert("Veuillez entrer un nom pour le plan.");
      return;
    }

    const plan = { name: planName, layout };
    const updatedPlans = [...savedPlans.filter(p => p.name !== planName), plan];
    localStorage.setItem('classroomPlans', JSON.stringify(updatedPlans));
    setSavedPlans(updatedPlans);
    alert("Plan sauvegardé avec succès !");
    setPlanName('');
  };

  const handlePlanSelection = (e) => {
    const selectedPlanName = e.target.value;
    setSelectedPlan(selectedPlanName);
  };

  const loadPlan = () => {
    const planToLoad = savedPlans.find(plan => plan.name === selectedPlan);
    if (planToLoad) {
      setLayout(planToLoad.layout);
      setPlanName(planToLoad.name);
    }
  };

  const deleteAllPlans = () => {
    localStorage.removeItem('classroomPlans');
    setSavedPlans([]);
    setSelectedPlan('');
    setLayout([]);
    alert("Tous les plans ont été supprimés.");
  };

  const onLayoutChange = (newLayout) => {
    const updatedLayout = newLayout.map(newItem => {
      const existingItem = layout.find(item => item.i === newItem.i);
      return { ...existingItem, ...newItem };
    });
    setLayout(updatedLayout);
  };

  // Calculate the number of rows based on the container height
  const rowHeight = CELL_SIZE;
  const maxRows = Math.floor(gridDimensions.height / rowHeight);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ width: '200px', padding: '10px', borderRight: '1px solid #ccc' }}>
        <h3>Modules</h3>
        {Object.entries(ModuleTypes).map(([type, { name, color }]) => (
          <div
            key={type}
            style={{
              padding: '10px',
              margin: '5px',
              backgroundColor: color,
              border: '1px solid #ddd',
              borderRadius: '5px',
              textAlign: 'center',
              cursor: 'move',
            }}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('moduleType', type);
            }}
          >
            {name}
          </div>
        ))}
      </div>
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '20px' }}>
          <Input
            type="text"
            placeholder="Nom du plan"
            value={planName}
            onChange={(e) => setPlanName(e.target.value)}
          />
          <Button onClick={savePlan}>Sauvegarder le plan</Button>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <select
            value={selectedPlan}
            onChange={handlePlanSelection}
            style={{ marginRight: '10px' }}
          >
            <option value="">Sélectionnez un plan</option>
            {savedPlans.map(plan => (
              <option key={plan.name} value={plan.name}>{plan.name}</option>
            ))}
          </select>
          <Button onClick={loadPlan}>Charger le plan</Button>
        </div>
        <Button onClick={deleteAllPlans} style={{ marginBottom: '20px', backgroundColor: 'red', color: 'white' }}>
          Supprimer tous les plans
        </Button>
        <div 
          ref={gridContainerRef}
          style={{ 
            width: '100%',
            height: 'calc(100vh - 200px)', // Adjust this value based on your layout
            position: 'relative',
            border: '1px solid #ccc',
            backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
            backgroundImage: 'linear-gradient(to right, #e0e0e0 1px, transparent 1px), linear-gradient(to bottom, #e0e0e0 1px, transparent 1px)'
          }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <GridLayout
            className="layout"
            layout={layout}
            cols={GRID_COLS}
            rowHeight={rowHeight}
            width={gridDimensions.width}
            maxRows={maxRows}
            compactType={null}
            preventCollision={false}
            onLayoutChange={onLayoutChange}
            draggableHandle=".grid-item-content"
            style={{ height: '100%' }}
          >
            {layout.map(item => (
              <div
                key={item.i}
                className="grid-item"
                style={{ 
                  backgroundColor: ModuleTypes[item.type]?.color || 'grey',
                  position: 'relative',
                  overflow: 'visible'  // Allow the delete button to overflow
                }}
              >
                <div className="grid-item-content" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {ModuleTypes[item.type]?.name}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(item);
                  }}
                  style={{
                    position: 'absolute',
                    top: '-10px',
                    right: '-10px',
                    width: '20px',
                    height: '20px',
                    backgroundColor: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    zIndex: 1000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    padding: 0
                  }}            
                >
                  X
                </button>
              </div>
            ))}
          </GridLayout>
        </div>
      </div>
    </div>
  );
};

export default ClassroomDesigner;
