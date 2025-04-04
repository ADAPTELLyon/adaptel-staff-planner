
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

interface Client {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  email: string;
  secteur: string;
  groupeClient: string;
  contactNom: string;
  contactPrenom: string;
  contactEmail: string;
  contactTelephone: string;
}

const Clients = () => {
  const [recherche, setRecherche] = useState("");
  
  // Données factices pour les clients
  const [clients, setClients] = useState<Client[]>([
    {
      id: "1",
      nom: "Restaurant Le Gourmet",
      adresse: "15 rue de la Gastronomie",
      ville: "Lyon",
      telephone: "04 78 XX XX XX",
      email: "contact@legourmet.fr",
      secteur: "Cuisine",
      groupeClient: "Restaurants indépendants",
      contactNom: "Durand",
      contactPrenom: "Jean",
      contactEmail: "j.durand@legourmet.fr",
      contactTelephone: "06 XX XX XX XX"
    },
    {
      id: "2",
      nom: "Hôtel Bellevue",
      adresse: "22 avenue du Parc",
      ville: "Lyon",
      telephone: "04 72 XX XX XX",
      email: "reception@bellevue-hotel.fr",
      secteur: "Réception",
      groupeClient: "Hôtels premium",
      contactNom: "Moreau",
      contactPrenom: "Marie",
      contactEmail: "m.moreau@bellevue-hotel.fr",
      contactTelephone: "06 XX XX XX XX"
    }
  ]);

  const clientsFiltres = clients.filter(client => 
    client.nom.toLowerCase().includes(recherche.toLowerCase()) || 
    client.ville.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau client
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un client..."
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
              <TableHead>Ville</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Secteur</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clientsFiltres.length > 0 ? (
              clientsFiltres.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nom}</TableCell>
                  <TableCell>{client.ville}</TableCell>
                  <TableCell>{client.telephone}</TableCell>
                  <TableCell>{client.email}</TableCell>
                  <TableCell>{client.secteur}</TableCell>
                  <TableCell>{`${client.contactPrenom} ${client.contactNom}`}</TableCell>
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
                  Aucun client trouvé
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Clients;
