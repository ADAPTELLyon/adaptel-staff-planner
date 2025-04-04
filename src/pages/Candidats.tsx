
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Edit, Plus, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  vehicule: boolean;
  prioritaire: boolean;
  actif: boolean;
  commentaire?: string;
  secteurs: string[];
}

const Candidats = () => {
  const [recherche, setRecherche] = useState("");
  
  // Données factices pour les candidats
  const [candidats, setCandidats] = useState<Candidat[]>([
    {
      id: "1",
      nom: "Dupont",
      prenom: "Martin",
      email: "m.dupont@example.com",
      telephone: "06 XX XX XX XX",
      vehicule: true,
      prioritaire: true,
      actif: true,
      commentaire: "Expérience en cuisine gastronomique",
      secteurs: ["Cuisine", "Plonge"]
    },
    {
      id: "2",
      nom: "Laurent",
      prenom: "Sophie",
      email: "s.laurent@example.com",
      telephone: "07 XX XX XX XX",
      vehicule: false,
      prioritaire: false,
      actif: true,
      secteurs: ["Réception"]
    },
    {
      id: "3",
      nom: "Petit",
      prenom: "Thomas",
      email: "t.petit@example.com",
      telephone: "06 XX XX XX XX",
      vehicule: true,
      prioritaire: false,
      actif: false,
      commentaire: "Inactif depuis le 15/03",
      secteurs: ["Salle", "Étages"]
    }
  ]);

  const candidatsFiltres = candidats.filter(candidat => 
    `${candidat.nom} ${candidat.prenom}`.toLowerCase().includes(recherche.toLowerCase()) || 
    candidat.email.toLowerCase().includes(recherche.toLowerCase()) ||
    candidat.secteurs.some(s => s.toLowerCase().includes(recherche.toLowerCase()))
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Candidats</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau candidat
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un candidat..."
              className="pl-10"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Secteurs</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Attributs</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {candidatsFiltres.length > 0 ? (
              candidatsFiltres.map((candidat) => (
                <TableRow key={candidat.id} className={!candidat.actif ? "bg-gray-100" : ""}>
                  <TableCell className="font-medium">{`${candidat.prenom} ${candidat.nom}`}</TableCell>
                  <TableCell>{candidat.telephone}</TableCell>
                  <TableCell>{candidat.email}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {candidat.secteurs.map((secteur) => (
                        <Badge key={secteur} variant="outline">{secteur}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={candidat.actif ? "default" : "secondary"}>
                      {candidat.actif ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {candidat.vehicule && <Badge variant="outline" className="bg-blue-50">Véhicule</Badge>}
                      {candidat.prioritaire && <Badge variant="outline" className="bg-green-50">Prioritaire</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Aucun candidat trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Candidats;
