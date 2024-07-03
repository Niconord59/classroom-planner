import React, { useState } from 'react';
import { Card, CardContent } from "./components/ui/Card";
import { Button } from "./components/ui/Button";
import { User, Layout, Users } from 'lucide-react';
import GestionEleves from './GestionEleves';
import ClassroomDesigner from './ClassroomDesigner';
import StudentPlacement from './StudentPlacement';

const PlanDeClasse = () => {
  const [action, setAction] = useState(null);

  const renderActionContent = () => {
    switch (action) {
      case 'mesEleves':
        return <GestionEleves />;
      case 'creerSalle':
        return <ClassroomDesigner />;
      case 'placerEleves':
        return <StudentPlacement />;
      default:
        return null;
    }
  };

  if (action) {
    return (
      <div className="container mx-auto p-4">
        <Button onClick={() => setAction(null)} className="mb-4">Retour au menu principal</Button>
        {renderActionContent()}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold mb-8 text-blue-500">CHOISISSEZ UNE ACTION</h1>
      
      <div className="flex flex-wrap justify-center gap-8">
        <Card className="w-64 h-64 bg-green-300 hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center justify-center h-full">
            <User size={48} className="text-green-600 mb-4" />
            <div className="text-center mb-4">
              <p className="font-bold">Gérez votre liste d'élèves</p>
              <p className="text-sm">Ajoutez, modifiez ou supprimez des élèves</p>
            </div>
            <Button 
              className="mt-2 bg-green-500 text-white hover:bg-green-600"
              onClick={() => setAction('mesEleves')}
            >
              MES ÉLÈVES
            </Button>
          </CardContent>
        </Card>

        <Card className="w-64 h-64 bg-yellow-300 hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center justify-center h-full">
            <Layout size={48} className="text-yellow-600 mb-4" />
            <div className="text-center mb-4">
              <p className="font-bold">Créez votre salle de classe</p>
              <p className="text-sm">Définissez la disposition de votre classe</p>
            </div>
            <Button 
              className="mt-4 bg-yellow-500 text-white hover:bg-yellow-600"
              onClick={() => setAction('creerSalle')}
            >
              CRÉER MA SALLE
            </Button>
          </CardContent>
        </Card>

        <Card className="w-64 h-64 bg-blue-300 hover:shadow-lg transition-shadow">
          <CardContent className="flex flex-col items-center justify-center h-full">
            <Users size={48} className="text-blue-600 mb-4" />
            <div className="text-center mb-4">
              <p className="font-bold">Placez vos élèves</p>
              <p className="text-sm">Automatisez le placement des élèves</p>
            </div>
            <Button 
              className="mt-2 bg-blue-500 text-white hover:bg-blue-600"
              onClick={() => setAction('placerEleves')}
            >
              PLACER MES ÉLÈVES
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PlanDeClasse;