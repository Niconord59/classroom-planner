import React, { useState, useEffect, useRef } from 'react';
import GridLayout from 'react-grid-layout';
import { Button } from '@progress/kendo-react-buttons';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
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
  TEACHER_ASSIGNED_TABLE: { name: 'Table attitrée', color: '#FFA500' }
};

const StudentPlacement = () => {
  const [savedPlans, setSavedPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [students, setStudents] = useState([]);
  const [placedStudents, setPlacedStudents] = useState([]);
  const [savedLists, setSavedLists] = useState([]);
  const [selectedList, setSelectedList] = useState(null);
  const gridContainerRef = useRef(null);
  const [gridDimensions, setGridDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const plans = JSON.parse(localStorage.getItem('classroomPlans') || '[]');
    setSavedPlans(plans);

    const lists = JSON.parse(localStorage.getItem('savedStudentLists') || '[]');
    setSavedLists(lists);

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

  const handlePlanSelection = (e) => {
    const planName = e.target.value;
    const plan = savedPlans.find(p => p.name === planName);
    if (plan) {
      setSelectedPlan(plan);
    }
  };

  const handleListSelection = (e) => {
    const listName = e.target.value;
    const list = savedLists.find(l => l.name === listName);
    if (list) {
      setSelectedList(list);
      setStudents(list.students);
    }
  };

  const areAdjacent = (x1, y1, x2, y2) => {
    return Math.abs(x1 - x2) <= 1 && Math.abs(y1 - y2) <= 1;
  };

  const canBePlacedHere = (student, table, placedStudentsMap) => {
    for (let [id, placedStudent] of placedStudentsMap) {
      if (areAdjacent(table.x, table.y, placedStudent.x, placedStudent.y) &&
          (student.neSentendPasWith.includes(id) || placedStudent.neSentendPasWith.includes(student.id))) {
        return false;
      }
    }
    return true;
  };

  const placeStudents = () => {
    if (!selectedPlan || !selectedList) {
      alert("Veuillez sélectionner un plan et une liste d'élèves avant de placer les élèves.");
      return;
    }

    const tables = selectedPlan.layout.filter(item => item.type === 'TABLE');
    const teacherTables = selectedPlan.layout.filter(item => item.type === 'TEACHER_TABLE');
    const assignedTables = selectedPlan.layout.filter(item => item.type === 'TEACHER_ASSIGNED_TABLE');
    const board = selectedPlan.layout.find(item => item.type === 'BOARD');

    if (!teacherTables.length || !board || !assignedTables.length) {
      alert("Le plan sélectionné doit contenir au moins une 'Table Professeur', un 'Tableau' et une ou plusieurs 'Table attitrée'.");
      return;
    }

    const placedStudentsMap = new Map();
    const sortedStudents = [...students];

    // Placement prioritaire des élèves ayant la mention "Oui" pour "Place attitrée"
    sortedStudents.filter(s => s.placeAttitree === "Oui").forEach((student, index) => {
      const table = assignedTables[index];
      if (table) {
        placedStudentsMap.set(student.id, {
          ...student,
          x: table.x,
          y: table.y,
        });
      }
    });

    // Remove the assigned tables from the list of available tables
    assignedTables.forEach(table => {
      const index = tables.indexOf(table);
      if (index > -1) {
        tables.splice(index, 1);
      }
    });

    // Placement des élèves agitateurs à côté de la table du professeur
    sortedStudents.filter(s => s.comportement === 'Agitateur').forEach(student => {
      const adjacentTables = tables.filter(table =>
        teacherTables.some(teacherTable =>
          (Math.abs(table.x - teacherTable.x) <= 1 && Math.abs(table.y - teacherTable.y) <= 1) &&
          !(table.x === teacherTable.x && table.y === teacherTable.y) // Exclude the teacher table itself
        )
      );
      const table = adjacentTables[0];
      if (table && canBePlacedHere(student, table, placedStudentsMap)) {
        placedStudentsMap.set(student.id, {
          ...student,
          x: table.x,
          y: table.y,
        });
        tables.splice(tables.indexOf(table), 1); // Remove the table from the list
      }
    });

    // Placement des élèves qui portent des lunettes dans les deux premières rangées
    sortedStudents.filter(s => s.porteDesLunettes === 'Oui').forEach(student => {
      const table = tables.find(table => table.y < 2 && canBePlacedHere(student, table, placedStudentsMap));
      if (table) {
        placedStudentsMap.set(student.id, {
          ...student,
          x: table.x,
          y: table.y,
        });
        tables.splice(tables.indexOf(table), 1); // Remove the table from the list
      }
    });

    // Placement des élèves avec un niveau académique faible le plus proche possible du tableau
    sortedStudents.filter(s => s.niveauAcademique === 'Faible').forEach(student => {
      const table = tables
        .filter(table => canBePlacedHere(student, table, placedStudentsMap))
        .sort((a, b) => (Math.abs(a.x - board.x) + Math.abs(a.y - board.y)) - (Math.abs(b.x - board.x) + (Math.abs(b.y - board.y))))[0];
      if (table) {
        placedStudentsMap.set(student.id, {
          ...student,
          x: table.x,
          y: table.y,
        });
        tables.splice(tables.indexOf(table), 1); // Remove the table from the list
      }
    });

    // Placement des autres élèves
    sortedStudents.forEach(student => {
      if (!placedStudentsMap.has(student.id)) {
        const table = tables.find(table => canBePlacedHere(student, table, placedStudentsMap));
        if (table) {
          placedStudentsMap.set(student.id, {
            ...student,
            x: table.x,
            y: table.y,
          });
          tables.splice(tables.indexOf(table), 1); // Remove the table from the list
        }
      }
    });

    setPlacedStudents(Array.from(placedStudentsMap.values()));
  };

  const downloadPDF = () => {
    html2canvas(gridContainerRef.current).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save('classroom-layout.pdf');
    });
  };

  const rowHeight = CELL_SIZE;
  const maxRows = Math.floor(gridDimensions.height / rowHeight);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <div className="mb-4">
          <label htmlFor="list-select" className="block mb-2">Sélectionnez une liste d'élèves :</label>
          <select
            id="list-select"
            value={selectedList ? selectedList.name : ''}
            onChange={handleListSelection}
            className="w-full p-2 border rounded"
          >
            <option value="">Choisissez une liste</option>
            {savedLists.map(list => (
              <option key={list.name} value={list.name}>{list.name}</option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label htmlFor="plan-select" className="block mb-2">Sélectionnez un plan :</label>
          <select
            id="plan-select"
            value={selectedPlan ? selectedPlan.name : ''}
            onChange={handlePlanSelection}
            className="w-full p-2 border rounded"
          >
            <option value="">Choisissez un plan</option>
            {savedPlans.map(plan => (
              <option key={plan.name} value={plan.name}>{plan.name}</option>
            ))}
          </select>
        </div>

        <Button onClick={placeStudents} className="mb-4" disabled={!selectedList || !selectedPlan}>
          Placer automatiquement les élèves
        </Button>
        <Button onClick={downloadPDF} className="mb-4">
          Télécharger le plan en PDF
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
        >
          {selectedPlan && (
            <GridLayout
              className="layout"
              layout={selectedPlan.layout}
              cols={GRID_COLS}
              rowHeight={rowHeight}
              width={gridDimensions.width}
              maxRows={maxRows}
              compactType={null}
              preventCollision={false}
              isDraggable={false}
              isResizable={false}
              style={{ height: '100%' }}
            >
              {selectedPlan.layout.map(item => (
                <div
                  key={item.i}
                  className="grid-item"
                  style={{ 
                    backgroundColor: ModuleTypes[item.type]?.color || 'grey',
                    position: 'relative',
                    overflow: 'visible'
                  }}
                >
                  <div className="grid-item-content" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {item.type !== 'TABLE' && item.type !== 'TEACHER_ASSIGNED_TABLE' && ModuleTypes[item.type]?.name}
                    {(item.type === 'TABLE' || item.type === 'TEACHER_ASSIGNED_TABLE') && (
                      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2px' }}>
                        {placedStudents.find(s => s.x === item.x && s.y === item.y)?.nom || ''}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </GridLayout>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentPlacement;
