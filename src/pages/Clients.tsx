import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Edit, Trash2, Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Client {
  id: string;
  created_at: string;
  nom: string;
  adresse: string | null;
  ville: string | null;
  telephone: string | null;
  email: string | null;
  secteur: string | null;
  groupe_client: string | null;
  contact_nom: string | null;
  contact_prenom: string | null;
  contact_email: string | null;
  contact_telephone: string | null;
}

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    nom: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    secteur: '',
    groupe_client: '',
    contact_nom: '',
    contact_prenom: '',
    contact_email: '',
    contact_telephone: ''
  });
  
  const initialFormState = {
    id: '',
    nom: '',
    adresse: '',
    ville: '',
    telephone: '',
    email: '',
    secteur: '',
    groupe_client: '',
    contact_nom: '',
    contact_prenom: '',
    contact_email: '',
    contact_telephone: ''
  };

  // Fetch clients from Supabase
  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };
  
  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validation basique
      if (!formData.nom) {
        toast.error("Le nom du client est requis");
        return;
      }
      
      if (isEditing) {
        const { error } = await supabase
          .from('clients')
          .update({
            nom: formData.nom,
            adresse: formData.adresse,
            ville: formData.ville,
            telephone: formData.telephone,
            email: formData.email,
            secteur: formData.secteur,
            groupe_client: formData.groupe_client,
            contact_nom: formData.contact_nom,
            contact_prenom: formData.contact_prenom,
            contact_email: formData.contact_email,
            contact_telephone: formData.contact_telephone
          })
          .eq('id', formData.id);
        
        if (error) throw error;
        
        toast.success("Client mis à jour");
      } else {
        // CORRECTION: Remplacer l'array par un objet unique
        const { error } = await supabase
          .from('clients')
          .insert({
            nom: formData.nom,
            adresse: formData.adresse,
            ville: formData.ville,
            telephone: formData.telephone,
            email: formData.email,
            secteur: formData.secteur,
            groupe_client: formData.groupe_client,
            contact_nom: formData.contact_nom,
            contact_prenom: formData.contact_prenom,
            contact_email: formData.contact_email,
            contact_telephone: formData.contact_telephone
          });
        
        if (error) throw error;
        
        toast.success("Client ajouté");
      }
      
      // Réinitialisation du formulaire et rechargement des données
      setFormData(initialFormState);
      setIsEditing(false);
      setDialogOpen(false);
      fetchClients();
    } catch (error) {
      console.error('Error saving client:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle edit client
  const handleEditClient = (client: Client) => {
    setFormData({ ...client });
    setIsEditing(true);
    setDialogOpen(true);
  };

  // Handle delete client
  const handleDeleteClient = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      try {
        const { error } = await supabase
          .from('clients')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        // Refresh clients list
        fetchClients();
        toast.success("Client supprimé avec succès");
      } catch (error) {
        console.error('Error deleting client:', error);
        toast.error("Erreur lors de la suppression du client");
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={() => {
          setFormData(initialFormState);
          setIsEditing(false);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      </div>

      <Card className="rounded-lg shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nom</TableHead>
              <TableHead>Adresse</TableHead>
              <TableHead>Ville</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Secteur</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell>{client.nom}</TableCell>
                <TableCell>{client.adresse}</TableCell>
                <TableCell>{client.ville}</TableCell>
                <TableCell>{client.telephone}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.secteur}</TableCell>
                <TableCell>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditClient(client)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => handleDeleteClient(client.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Client Form Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Modifier Client" : "Ajouter Client"}</DialogTitle>
            <DialogDescription>
              {isEditing ? "Modifiez les informations du client." : "Ajoutez un nouveau client à la base de données."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="nom">Nom</Label>
              <Input 
                type="text" 
                id="nom" 
                name="nom" 
                value={formData.nom} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input 
                type="text" 
                id="adresse" 
                name="adresse" 
                value={formData.adresse || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ville">Ville</Label>
              <Input 
                type="text" 
                id="ville" 
                name="ville" 
                value={formData.ville || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="telephone">Téléphone</Label>
              <Input 
                type="tel" 
                id="telephone" 
                name="telephone" 
                value={formData.telephone || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="secteur">Secteur</Label>
              <Input 
                type="text" 
                id="secteur" 
                name="secteur" 
                value={formData.secteur || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="groupe_client">Groupe Client</Label>
              <Input 
                type="text" 
                id="groupe_client" 
                name="groupe_client" 
                value={formData.groupe_client || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_nom">Contact Nom</Label>
              <Input 
                type="text" 
                id="contact_nom" 
                name="contact_nom" 
                value={formData.contact_nom || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_prenom">Contact Prénom</Label>
              <Input 
                type="text" 
                id="contact_prenom" 
                name="contact_prenom" 
                value={formData.contact_prenom || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input 
                type="email" 
                id="contact_email" 
                name="contact_email" 
                value={formData.contact_email || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="contact_telephone">Contact Téléphone</Label>
              <Input 
                type="tel" 
                id="contact_telephone" 
                name="contact_telephone" 
                value={formData.contact_telephone || ''} 
                onChange={handleInputChange} 
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isEditing ? "Mettre à jour" : "Enregistrer"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
