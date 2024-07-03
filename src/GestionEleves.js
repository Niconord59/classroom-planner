import React, { useState, useEffect } from 'react';
import { Button } from "./components/ui/Button";
import { Input } from "./components/ui/Input";
import { Label } from "./components/ui/Label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./components/ui/Select";
import { Checkbox } from "./components/ui/Checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/Card";
import { Dialog, DialogHeader, DialogTitle } from "./components/ui/Dialog";

const GestionEleves = () => {
  const [eleves, setEleves] = useState([]);
  const [nouvelEleve, setNouvelEleve] = useState({
    nom: '',
    genre: '',
    niveauAcademique: '',
    comportement: '',
    participation: '',
    besoinsSpecifiques: [],
    preferencesApprentissage: [],
    neSentendPasWith: [],
    porteDesLunettes: '',
    placeAttitree: ''
  });
  const [optionsPersonnalisees, setOptionsPersonnalisees] = useState({
    besoinsSpecifiques: [],
    preferencesApprentissage: []
  });
  const [eleveEnEdition, setEleveEnEdition] = useState(null);
  const [nomListe, setNomListe] = useState('');
  const [savedLists, setSavedLists] = useState([]);
  const [currentListIndex, setCurrentListIndex] = useState(null);

  useEffect(() => {
    const savedEleves = localStorage.getItem('eleves');
    if (savedEleves) {
      setEleves(JSON.parse(savedEleves));
    }
    const lists = localStorage.getItem('savedStudentLists');
    if (lists) {
      setSavedLists(JSON.parse(lists));
    }
  }, []);

  const sauvegarderEleves = () => {
    localStorage.setItem('eleves', JSON.stringify(eleves));
  };

  const sauvegarderListe = () => {
    if (!nomListe.trim() && currentListIndex === null) {
      alert("Veuillez entrer un nom pour la liste.");
      return;
    }

    const newList = {
      name: nomListe || savedLists[currentListIndex].name,
      students: eleves
    };

    let updatedLists;
    if (currentListIndex !== null) {
      updatedLists = savedLists.map((list, index) => 
        index === currentListIndex ? newList : list
      );
    } else {
      updatedLists = [...savedLists, newList];
    }

    setSavedLists(updatedLists);
    localStorage.setItem('savedStudentLists', JSON.stringify(updatedLists));
    alert("Liste sauvegardée avec succès !");
    setNomListe('');
  };

  const chargerListe = (index) => {
    const list = savedLists[index];
    setEleves(list.students);
    setNomListe(list.name);
    setCurrentListIndex(index);
    sauvegarderEleves();
  };

  const supprimerListe = (index) => {
    const confirmDelete = window.confirm("Êtes-vous sûr de vouloir supprimer cette liste ?");
    if (confirmDelete) {
      const updatedLists = savedLists.filter((_, i) => i !== index);
      setSavedLists(updatedLists);
      localStorage.setItem('savedStudentLists', JSON.stringify(updatedLists));
      alert("Liste supprimée avec succès !");
      setCurrentListIndex(null);
      setNomListe('');
    }
  };

  const handleInputChange = (name, value, isEditMode = false) => {
    if (isEditMode) {
      setEleveEnEdition(prev => ({ ...prev, [name]: value }));
    } else {
      setNouvelEleve(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleMultiSelectChange = (name, value, isEditMode = false) => {
    const updateFunction = (prev) => ({
      ...prev,
      [name]: prev[name].includes(value)
        ? prev[name].filter(item => item !== value)
        : [...prev[name], value]
    });

    if (isEditMode) {
      setEleveEnEdition(updateFunction);
    } else {
      setNouvelEleve(updateFunction);
    }
  };

  const ajouterEleve = () => {
    const newEleves = [...eleves, { 
      ...nouvelEleve, 
      id: Date.now().toString(),
      neSentendPasWith: Array.isArray(nouvelEleve.neSentendPasWith) ? nouvelEleve.neSentendPasWith : []
    }];
    setEleves(newEleves);
    sauvegarderEleves();
    setNouvelEleve({
      nom: '',
      genre: '',
      niveauAcademique: '',
      comportement: '',
      participation: '',
      besoinsSpecifiques: [],
      preferencesApprentissage: [],
      neSentendPasWith: [],
      porteDesLunettes: '',
      placeAttitree: ''
    });
  };

  const commencerEdition = (eleve) => {
    setEleveEnEdition(eleve);
  };

  const sauvegarderEdition = () => {
    setEleves(prevEleves => prevEleves.map(el => el.id === eleveEnEdition.id ? eleveEnEdition : el));
    sauvegarderEleves();
    setEleveEnEdition(null);
  };

  const annulerEdition = () => {
    setEleveEnEdition(null);
  };

  const supprimerEleve = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ?")) {
      setEleves(prevEleves => prevEleves.filter(eleve => eleve.id !== id));
      sauvegarderEleves();
    }
  };

  const ajouterOptionPersonnalisee = (categorie, nouvelleOption) => {
    setOptionsPersonnalisees(prev => ({
      ...prev,
      [categorie]: [...prev[categorie], nouvelleOption]
    }));
  };

  // Fonction pour générer des élèves aléatoires
  const generateRandomStudents = () => {
    const randomNames = [
      { name: "Nicolas", gender: "Garçon" },
      { name: "Marie", gender: "Fille" },
      { name: "Jean", gender: "Garçon" },
      { name: "Lucie", gender: "Fille" },
      { name: "Pierre", gender: "Garçon" },
      { name: "Elodie", gender: "Fille" },
      { name: "Louis", gender: "Garçon" },
      { name: "Sophie", gender: "Fille" },
      { name: "Julien", gender: "Garçon" },
      { name: "Camille", gender: "Fille" }
    ];
    const randomNiveaux = ["Faible", "Moyen", "Bon", "Très bon"];
    const randomComportements = ["Calme", "Bavard", "Agitateur"];
    const randomParticipations = ["Bonne participation", "Participe sans plus", "Ne participe pas du tout"];
    const randomBesoins = ["Aucun", "Dyslexie", "Trouble de l'attention"];
    const randomPreferences = ["Visuel", "Auditif", "Kinesthésique"];

    const generateRandomValue = (array) => array[Math.floor(Math.random() * array.length)];

    const newStudents = Array.from({ length: 25 }, () => {
      const randomName = generateRandomValue(randomNames);
      return {
        id: Date.now().toString() + Math.random().toString(36).substring(2, 15),
        nom: randomName.name,
        genre: randomName.gender,
        niveauAcademique: generateRandomValue(randomNiveaux),
        comportement: generateRandomValue(randomComportements),
        participation: generateRandomValue(randomParticipations),
        besoinsSpecifiques: [generateRandomValue(randomBesoins)],
        preferencesApprentissage: [generateRandomValue(randomPreferences)],
        neSentendPasWith: [],
        porteDesLunettes: generateRandomValue(["Oui", "Non"]),
        placeAttitree: generateRandomValue(["Oui", "Non"])
      };
    });

    setEleves(newStudents);
    sauvegarderEleves();
  };

  const renderForm = (eleve, isEditMode = false) => (
    <form onSubmit={(e) => { e.preventDefault(); isEditMode ? sauvegarderEdition() : ajouterEleve(); }} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor={isEditMode ? "edit-nom" : "nom"}>Nom de l'élève</Label>
          <Input 
            id={isEditMode ? "edit-nom" : "nom"}
            value={eleve.nom} 
            onChange={(e) => handleInputChange('nom', e.target.value, isEditMode)} 
            required 
          />
        </div>
        
        <div>
          <Label htmlFor={isEditMode ? "edit-genre" : "genre"}>Genre</Label>
          <Select onValueChange={(value) => handleInputChange('genre', value, isEditMode)} value={eleve.genre}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Garçon">Garçon</SelectItem>
              <SelectItem value="Fille">Fille</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={isEditMode ? "edit-niveauAcademique" : "niveauAcademique"}>Niveau Académique</Label>
          <Select onValueChange={(value) => handleInputChange('niveauAcademique', value, isEditMode)} value={eleve.niveauAcademique}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Faible">Faible</SelectItem>
              <SelectItem value="Moyen">Moyen</SelectItem>
              <SelectItem value="Bon">Bon</SelectItem>
              <SelectItem value="Très bon">Très bon</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={isEditMode ? "edit-comportement" : "comportement"}>Comportement</Label>
          <Select onValueChange={(value) => handleInputChange('comportement', value, isEditMode)} value={eleve.comportement}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Calme">Calme</SelectItem>
              <SelectItem value="Bavard">Bavard</SelectItem>
              <SelectItem value="Agitateur">Agitateur</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={isEditMode ? "edit-participation" : "participation"}>Participation en classe</Label>
          <Select onValueChange={(value) => handleInputChange('participation', value, isEditMode)} value={eleve.participation}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Bonne participation">Bonne participation</SelectItem>
              <SelectItem value="Participe sans plus">Participe sans plus</SelectItem>
              <SelectItem value="Ne participe pas du tout">Ne participe pas du tout</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <Label htmlFor={isEditMode ? "edit-porteDesLunettes" : "porteDesLunettes"}>Porte des lunettes</Label>
          <Select onValueChange={(value) => handleInputChange('porteDesLunettes', value, isEditMode)} value={eleve.porteDesLunettes}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Oui">Oui</SelectItem>
              <SelectItem value="Non">Non</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor={isEditMode ? "edit-placeAttitree" : "placeAttitree"}>Place attitrée</Label>
          <Select onValueChange={(value) => handleInputChange('placeAttitree', value, isEditMode)} value={eleve.placeAttitree}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Oui">Oui</SelectItem>
              <SelectItem value="Non">Non</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Besoins Spécifiques</Label>
          <div className="h-[200px] w-[350px] overflow-y-auto rounded-md border p-4">
            <div className="space-y-2">
              {['Aucun', 'Dyslexie', "Trouble de l'attention", ...optionsPersonnalisees.besoinsSpecifiques].map(besoin => (
                <div key={besoin} className="flex items-center">
                  <Checkbox
                    id={`${isEditMode ? 'edit-' : ''}besoin-${besoin}`}
                    checked={eleve.besoinsSpecifiques.includes(besoin)}
                    onCheckedChange={(checked) => {
                      handleMultiSelectChange('besoinsSpecifiques', besoin, isEditMode);
                    }}
                  />
                  <Label htmlFor={`${isEditMode ? 'edit-' : ''}besoin-${besoin}`} className="ml-2">{besoin}</Label>
                </div>
              ))}
            </div>
          </div>
          <Input
            className="mt-2"
            placeholder="Ajouter un besoin spécifique"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                ajouterOptionPersonnalisee('besoinsSpecifiques', e.target.value);
                e.target.value = '';
              }
            }}
          />
        </div>

        <div>
          <Label>Préférences d'apprentissage</Label>
          <div className="h-[200px] w-[350px] overflow-y-auto rounded-md border p-4">
            <div className="space-y-2">
              {['Visuel', 'Auditif', 'Kinesthésique', ...optionsPersonnalisees.preferencesApprentissage].map(preference => (
                <div key={preference} className="flex items-center">
                  <Checkbox
                    id={`${isEditMode ? 'edit-' : ''}preference-${preference}`}
                    checked={eleve.preferencesApprentissage.includes(preference)}
                    onCheckedChange={(checked) => {
                      handleMultiSelectChange('preferencesApprentissage', preference, isEditMode);
                    }}
                  />
                  <Label htmlFor={`${isEditMode ? 'edit-' : ''}preference-${preference}`} className="ml-2">{preference}</Label>
                </div>
              ))}
            </div>
          </div>
          <Input
            className="mt-2"
            placeholder="Ajouter une préférence d'apprentissage"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                ajouterOptionPersonnalisee('preferencesApprentissage', e.target.value);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      <div>
        <Label>Ne s'entend pas avec</Label>
        <Select
          onValueChange={(value) => handleInputChange('neSentendPasWith', value, isEditMode)} 
          value={eleve.neSentendPasWith}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionnez des élèves..." />
          </SelectTrigger>
          <SelectContent>
            {eleves.filter(e => e.id !== eleve.id).map(e => (
              <SelectItem key={e.id} value={e.id}>{e.nom}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="submit">{isEditMode ? "Sauvegarder les modifications" : "Ajouter l'élève"}</Button>
        {isEditMode && <Button type="button" variant="outline" onClick={annulerEdition}>Annuler</Button>}
      </div>
    </form>
  );

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-4xl font-bold mb-6 text-center">Gestion des Élèves</h1>
      
      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle>Choix de la liste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <Button onClick={() => setEleves([])}>Créer une nouvelle liste</Button>
            {savedLists.length > 0 && (
              <select 
                onChange={(e) => chargerListe(e.target.selectedIndex - 1)} 
                className="form-select"
                defaultValue=""
              >
                <option value="" disabled>Choisir une liste sauvegardée</option>
                {savedLists.map((list, index) => (
                  <option key={index} value={index}>{list.name}</option>
                ))}
              </select>
            )}
          </div>
          {savedLists.length === 0 ? (
            <p className="text-gray-500">Aucune liste sauvegardée</p>
          ) : (
            <ul className="space-y-2">
              {savedLists.map((list, index) => (
                <li key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{list.name}</span>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => chargerListe(index)}>Charger</Button>
                    <Button size="sm" variant="destructive" onClick={() => supprimerListe(index)}>Supprimer cette liste</Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle>Ajouter un nouvel élève</CardTitle>
        </CardHeader>
        <CardContent>
          {renderForm(nouvelEleve)}
        </CardContent>
      </Card>

      <Card className="mb-6 shadow-lg">
        <CardHeader>
          <CardTitle>Liste des élèves</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-200 text-gray-600 uppercase text-sm leading-normal">
                  <th className="py-3 px-6 text-left">Nom</th>
                  <th className="py-3 px-6 text-left">Genre</th>
                  <th className="py-3 px-6 text-left">Niveau Académique</th>
                  <th className="py-3 px-6 text-left">Comportement</th>
                  <th className="py-3 px-6 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="text-gray-600 text-sm font-light">
                {eleves.map(eleve => (
                  <tr key={eleve.id} className="border-b border-gray-200 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left whitespace-nowrap">{eleve.nom}</td>
                    <td className="py-3 px-6 text-left">{eleve.genre}</td>
                    <td className="py-3 px-6 text-left">{eleve.niveauAcademique}</td>
                    <td className="py-3 px-6 text-left">{eleve.comportement}</td>
                    <td className="py-3 px-6 text-center">
                      <div className="flex item-center justify-center">
                        <Button onClick={() => commencerEdition(eleve)} size="sm">Modifier</Button>
                        <Button onClick={() => supprimerEleve(eleve.id)} variant="destructive" size="sm" className="ml-2">Supprimer</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-6 shadow-lg">
        <CardHeader>
          <CardTitle>Sauvegarder ma liste</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Nom de la liste"
              value={nomListe}
              onChange={(e) => setNomListe(e.target.value)}
            />
            <Button onClick={sauvegarderListe}>Sauvegarder ma liste</Button>
            <Button onClick={generateRandomStudents}>Générer une liste d'élèves aléatoirement</Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!eleveEnEdition} onOpenChange={setEleveEnEdition}>
        <DialogHeader>
          <DialogTitle>Modifier l'élève</DialogTitle>
        </DialogHeader>
        {eleveEnEdition && renderForm(eleveEnEdition, true)}
      </Dialog>
    </div>
  );
};

export default GestionEleves;
