
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Candidat {
  id: string;
  created_at: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  vehicule: boolean;
  prioritaire: boolean;
  actif: boolean;
  commentaire: string | null;
  secteurs: string[] | null;
}

const Candidats = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [secteurFilter, setSecteurFilter] = useState("Tous");
  
  const secteursOptions = ["Tous", "Cuisine", "Salle", "Plonge", "Réception", "Étages"];

  const initialFormState = {
    id: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    vehicule: false,
    prioritaire: false,
    actif: true,
    commentaire: "",
    secteurs: [],
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchCandidats = async () => {
    try {
      const { data, error } = await supabase
        .from('candidats')
        .select('*')
        .order('nom', { ascending: true });

      if (error) {
        throw error;
      }

      setCandidats(data || []);
    } catch (error) {
      console.error('Error fetching candidats:', error);
      toast.error("Erreur lors du chargement des candidats");
    }
  };

  useEffect(() => {
    fetchCandidats();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const target = e.target as HTMLInputElement;
    const isCheckbox = target.type === 'checkbox';
    
    setFormData(prevData => ({
      ...prevData,
      [name]: isCheckbox ? target.checked : value
    }));
  };
  
  const handleSecteurChange = (secteur: string) => {
    setFormData(prevData => {
      let updatedSecteurs = [...(prevData.secteurs || [])];
      
      if (updatedSecteurs.includes(secteur)) {
        updatedSecteurs = updatedSecteurs.filter(s => s !== secteur);
      } else {
        updatedSecteurs.push(secteur);
      }
      
      return { ...prevData, secteurs: updatedSecteurs };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validation basique
      if (!formData.nom || !formData.prenom) {
        toast.error("Le nom et prénom sont requis");
        return;
      }
      
      if (isEditing) {
        const { error } = await supabase
          .from('candidats')
          .update({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone,
            vehicule: formData.vehicule,
            prioritaire: formData.prioritaire,
            actif: formData.actif,
            commentaire: formData.commentaire,
            secteurs: formData.secteurs,
          })
          .eq('id', formData.id);
        
        if (error) throw error;
        
        toast.success("Candidat mis à jour");
      } else {
        // CORRECTION: Remplacer l'array par un objet unique
        const { error } = await supabase
          .from('candidats')
          .insert({
            nom: formData.nom,
            prenom: formData.prenom,
            email: formData.email,
            telephone: formData.telephone,
            vehicule: formData.vehicule,
            prioritaire: formData.prioritaire,
            actif: formData.actif,
            commentaire: formData.commentaire,
            secteurs: formData.secteurs,
          });
        
        if (error) throw error;
        
        toast.success("Candidat ajouté");
      }
      
      // Réinitialisation du formulaire et rechargement des données
      setFormData(initialFormState);
      setIsEditing(false);
      setDialogOpen(false);
      fetchCandidats();
    } catch (error) {
      console.error('Error saving candidat:', error);
      toast.error("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (candidat: Candidat) => {
    setFormData(candidat);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce candidat ?")) {
      try {
        const { error } = await supabase
          .from('candidats')
          .delete()
          .eq('id', id);

        if (error) {
          throw error;
        }

        toast.success("Candidat supprimé");
        fetchCandidats();
      } catch (error) {
        console.error('Error deleting candidat:', error);
        toast.error("Erreur lors de la suppression");
      }
    }
  };
  
  const filteredCandidats = candidats.filter(candidat => {
    const matchesSearch =
      candidat.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidat.prenom.toLowerCase().includes(searchQuery.toLowerCase());
      
    const matchesSecteur = secteurFilter === "Tous" || (candidat.secteurs && candidat.secteurs.includes(secteurFilter));

    return matchesSearch && matchesSecteur;
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Candidats</h1>
        <Button onClick={() => {
          setFormData(initialFormState);
          setIsEditing(false);
          setDialogOpen(true);
        }}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un candidat
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Input
          type="text"
          placeholder="Rechercher un candidat..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Select value={secteurFilter} onValueChange={setSecteurFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filtrer par secteur" />
          </SelectTrigger>
          <SelectContent>
            {secteursOptions.map(secteur => (
              <SelectItem key={secteur} value={secteur}>{secteur}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Téléphone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Secteurs</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredCandidats.map((candidat) => (
              <tr key={candidat.id}>
                <td className="px-6 py-4 whitespace-nowrap">{candidat.nom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{candidat.prenom}</td>
                <td className="px-6 py-4 whitespace-nowrap">{candidat.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">{candidat.telephone}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {candidat.secteurs ? candidat.secteurs.join(', ') : 'Non spécifié'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Button size="sm" variant="ghost" onClick={() => handleEdit(candidat)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Éditer
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => handleDelete(candidat.id)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Supprimer
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button>Open Dialog</Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Éditer le candidat" : "Ajouter un candidat"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nom">Nom</Label>
                <Input type="text" id="nom" name="nom" value={formData.nom} onChange={handleInputChange} />
              </div>
              <div>
                <Label htmlFor="prenom">Prénom</Label>
                <Input type="text" id="prenom" name="prenom" value={formData.prenom} onChange={handleInputChange} />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input type="email" id="email" name="email" value={formData.email || ""} onChange={handleInputChange} />
            </div>
            <div>
              <Label htmlFor="telephone">Téléphone</Label>
              <Input type="tel" id="telephone" name="telephone" value={formData.telephone || ""} onChange={handleInputChange} />
            </div>
            
            <div>
              <Label>Secteurs</Label>
              <div className="flex flex-wrap gap-2">
                {secteursOptions.filter(secteur => secteur !== "Tous").map(secteur => (
                  <div key={secteur} className="space-x-2">
                    <Checkbox
                      id={`secteur-${secteur}`}
                      checked={formData.secteurs?.includes(secteur) || false}
                      onCheckedChange={() => handleSecteurChange(secteur)}
                    />
                    <Label htmlFor={`secteur-${secteur}`}>{secteur}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Label htmlFor="vehicule">Véhicule</Label>
              <Switch id="vehicule" name="vehicule" checked={formData.vehicule} onCheckedChange={(checked) => setFormData({ ...formData, vehicule: checked })} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="prioritaire">Prioritaire</Label>
              <Switch id="prioritaire" name="prioritaire" checked={formData.prioritaire} onCheckedChange={(checked) => setFormData({ ...formData, prioritaire: checked })} />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="actif">Actif</Label>
              <Switch id="actif" name="actif" checked={formData.actif} onCheckedChange={(checked) => setFormData({ ...formData, actif: checked })} />
            </div>
            <div>
              <Label htmlFor="commentaire">Commentaire</Label>
              <Textarea id="commentaire" name="commentaire" value={formData.commentaire || ""} onChange={handleInputChange} />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Candidats;
