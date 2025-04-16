import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Building, Shirt, BarChart3, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tables } from "@/integrations/supabase/types";
import { Switch } from "@/components/ui/switch";

type Parametrage = Tables<"parametrages">;

const Parametrages = () => {
  const [services, setServices] = useState<Parametrage[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");
  const [groupes, setGroupes] = useState<Parametrage[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [tenues, setTenues] = useState<Parametrage[]>([]);
  const [isTenueDialogOpen, setIsTenueDialogOpen] = useState(false);
  const [newTenueName, setNewTenueName] = useState("");
  const [newTenueDescription, setNewTenueDescription] = useState("");
  const [loadingTenues, setLoadingTenues] = useState(false);
  const [editTenueId, setEditTenueId] = useState<string | null>(null);
  const [editTenueName, setEditTenueName] = useState("");
  const [editTenueDescription, setEditTenueDescription] = useState("");
  const [utilisateurs, setUtilisateurs] = useState<any[]>([]);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newUserPrenom, setNewUserPrenom] = useState("");
  const [newUserNom, setNewUserNom] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserActif, setNewUserActif] = useState(false);

  useEffect(() => {
    console.log("Page Paramétrages chargée");
    fetchServices();
    fetchGroupes();
    fetchTenues();
    fetchUtilisateurs();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("parametrages")
      .select("*")
      .eq("categorie", "service")
      .order("valeur");

    if (error) {
      console.error("Error fetching services:", error);
      return;
    }

    setServices(data || []);
  };

  const fetchGroupes = async () => {
    const { data, error } = await supabase
      .from("parametrages")
      .select("*")
      .eq("categorie", "groupe")
      .order("valeur");

    if (error) {
      console.error("Error fetching groupes:", error);
      return;
    }

    setGroupes(data || []);
  };

  const fetchTenues = async () => {
    setLoadingTenues(true);
    const { data, error } = await supabase
      .from("parametrages")
      .select("*")
      .eq("categorie", "tenue")
      .order("valeur");

    if (error) {
      console.error("Error fetching tenues:", error);
      setLoadingTenues(false);
      return;
    }

    setTenues(data || []);
    setLoadingTenues(false);
  };

  const fetchUtilisateurs = async () => {
    const { data, error } = await supabase
      .from("utilisateurs")
      .select("*");

    if (error) {
      console.error("Error fetching utilisateurs:", error);
      return;
    }

    setUtilisateurs(data || []);
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setNewServiceName("");
  };

  // Gérer l'ouverture/fermeture du dialogue
  const handleDialogOpenChange = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      resetForm();
    }
  };

  // Ajouter un nouveau service
  const handleAddService = async () => {
    if (!newServiceName.trim()) {
      toast.error("Le nom du service est obligatoire");
      return;
    }

    try {
      const { error } = await supabase
        .from("parametrages")
        .insert([{
          categorie: "service",
          valeur: newServiceName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Service ajouté avec succès");
      setIsDialogOpen(false);
      resetForm();
      fetchServices();
    } catch (error) {
      console.error("Error adding service:", error);
      toast.error("Une erreur est survenue lors de l'ajout du service");
    }
  };

  // Supprimer un service
  const handleDeleteService = async (serviceId: string) => {
    try {
      const { error } = await supabase
        .from("parametrages")
        .delete()
        .eq("id", serviceId)
        .eq("categorie", "service");

      if (error) throw error;

      toast.success("Service supprimé avec succès");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Une erreur est survenue lors de la suppression du service");
    }
  };

  const handleAddGroupe = async () => {
    if (!newGroupName.trim()) {
      toast.error("Le nom du groupe est obligatoire");
      return;
    }

    try {
      const { error } = await supabase
        .from("parametrages")
        .insert([{
          categorie: "groupe",
          valeur: newGroupName.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Groupe ajouté avec succès");
      setIsGroupDialogOpen(false);
      setNewGroupName("");
      fetchGroupes();
    } catch (error) {
      console.error("Error adding groupe:", error);
      toast.error("Une erreur est survenue lors de l'ajout du groupe");
    }
  };

  const handleDeleteGroupe = async (groupeId: string) => {
    try {
      const { error } = await supabase
        .from("parametrages")
        .delete()
        .eq("id", groupeId)
        .eq("categorie", "groupe");

      if (error) throw error;

      toast.success("Groupe supprimé avec succès");
      fetchGroupes();
    } catch (error) {
      console.error("Error deleting groupe:", error);
      toast.error("Une erreur est survenue lors de la suppression du groupe");
    }
  };

  const handleAddTenue = async () => {
    if (!newTenueName.trim()) {
      toast.error("Le nom de la tenue est obligatoire");
      return;
    }

    try {
      const { error } = await supabase
        .from("parametrages")
        .insert([{
          categorie: "tenue",
          valeur: newTenueName.trim(),
          description: newTenueDescription.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Tenue ajoutée avec succès");
      setIsTenueDialogOpen(false);
      setNewTenueName("");
      setNewTenueDescription("");
      fetchTenues();
    } catch (error) {
      console.error("Error adding tenue:", error);
      toast.error("Une erreur est survenue lors de l'ajout de la tenue");
    }
  };

  const handleDeleteTenue = async (tenueId: string) => {
    try {
      const { error } = await supabase
        .from("parametrages")
        .delete()
        .eq("id", tenueId)
        .eq("categorie", "tenue");

      if (error) throw error;

      toast.success("Tenue supprimée avec succès");
      fetchTenues();
    } catch (error) {
      console.error("Error deleting tenue:", error);
      toast.error("Une erreur est survenue lors de la suppression de la tenue");
    }
  };

  const handleEditTenue = (tenue: Parametrage) => {
    setEditTenueId(tenue.id);
    setEditTenueName(tenue.valeur);
    setEditTenueDescription(tenue.description || "");
    setIsTenueDialogOpen(true);
  };

  const handleUpdateTenue = async () => {
    if (!editTenueName.trim()) {
      toast.error("Le nom de la tenue est obligatoire");
      return;
    }

    try {
      const { error } = await supabase
        .from("parametrages")
        .update({
          valeur: editTenueName.trim(),
          description: editTenueDescription.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", editTenueId)
        .eq("categorie", "tenue");

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast.success("Tenue modifiée avec succès");
      setIsTenueDialogOpen(false);
      setEditTenueId(null);
      setEditTenueName("");
      setEditTenueDescription("");
      fetchTenues();
    } catch (error) {
      console.error("Error updating tenue:", error);
      toast.error("Une erreur est survenue lors de la modification de la tenue");
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim() || !newUserPassword.trim()) {
      toast.error("L'email et le mot de passe sont obligatoires");
      return;
    }

    try {
      const { error: authError } = await supabase.auth.admin.createUser({
        email: newUserEmail.trim(),
        password: newUserPassword.trim(),
      });

      if (authError) {
        console.error("Auth error:", authError);
        toast.error("Erreur lors de la création de l'utilisateur : " + authError.message);
        return;
      }

      const { error: dbError } = await supabase
        .from("utilisateurs")
        .insert([{
          prenom: newUserPrenom.trim(),
          nom: newUserNom.trim(),
          email: newUserEmail.trim(),
          actif: newUserActif,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }]);

      if (dbError) {
        console.error("Database error:", dbError);
        toast.error("Erreur lors de l'enregistrement de l'utilisateur : " + dbError.message);
        return;
      }

      toast.success("Utilisateur créé avec succès");
      setIsUserDialogOpen(false);
      setNewUserPrenom("");
      setNewUserNom("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserActif(false);
      fetchUtilisateurs();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Une erreur est survenue lors de la création de l'utilisateur");
    }
  };

  const handleToggleUserActif = async (userId: string, currentActif: boolean) => {
    try {
      const { error } = await supabase
        .from("utilisateurs")
        .update({ actif: !currentActif })
        .eq("id", userId);

      if (error) {
        console.error("Error updating user actif status:", error);
        toast.error("Une erreur est survenue lors de la mise à jour du statut de l'utilisateur");
        return;
      }

      toast.success("Statut de l'utilisateur mis à jour");
      fetchUtilisateurs();
    } catch (error) {
      console.error("Error toggling user actif status:", error);
      toast.error("Une erreur est survenue lors de la mise à jour du statut de l'utilisateur");
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Paramétrages</h1>
      
      <Tabs defaultValue="utilisateurs" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="utilisateurs" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Utilisateurs
          </TabsTrigger>
          <TabsTrigger value="groupes" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Groupes de clients
          </TabsTrigger>
          <TabsTrigger value="services" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Services
          </TabsTrigger>
          <TabsTrigger value="tenues" className="flex items-center gap-2">
            <Shirt className="h-4 w-4" />
            Tenues
          </TabsTrigger>
          <TabsTrigger value="donnees" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Données analytiques
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="utilisateurs">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={() => setIsUserDialogOpen(true)}
                >
                  +
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Gérez les utilisateurs ayant accès à l'application Adaptel Lyon.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {utilisateurs.map((user) => (
                  <Card key={user.id}>
                    <CardHeader>
                      <CardTitle className="text-base">
                        {user.prenom} {user.nom}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Email:</span>
                          <span className="text-sm font-medium">{user.email}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Statut:</span>
                          <Switch
                            checked={user.actif}
                            onCheckedChange={(checked) => handleToggleUserActif(user.id, checked)}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groupes">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Groupes de clients</CardTitle>
                <Button onClick={() => setIsGroupDialogOpen(true)}>
                  Ajouter un groupe
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Gérez les groupes permettant de categoriser vos clients.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {groupes.map((groupe) => (
                  <Card key={groupe.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">
                          {groupe.valeur}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGroupe(groupe.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="services">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Services</CardTitle>
                <Button onClick={() => setIsDialogOpen(true)}>
                  Ajouter un service
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">
                Gérez les services disponibles pour vos clients.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <Card key={service.id}>
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-base">
                          {service.valeur}
                        </CardTitle>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                        >
                          Supprimer
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tenues">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Tenues</CardTitle>
                <Button onClick={() => {
                  setEditTenueId(null);
                  setEditTenueName("");
                  setEditTenueDescription("");
                  setIsTenueDialogOpen(true);
                }}>
                  Ajouter une tenue
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Gérez les tenues disponibles pour vos clients.</p>
              
              {loadingTenues ? (
                <p>Chargement des tenues...</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tenues.map((tenue) => (
                    <Card key={tenue.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle className="text-base">
                            {tenue.valeur}
                          </CardTitle>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTenue(tenue)}
                            >
                              Modifier
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTenue(tenue.id)}
                            >
                              Supprimer
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p>{tenue.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="donnees">
          <Card>
            <CardHeader>
              <CardTitle>Données analytiques</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Configuration des données analytiques et objectifs 2024 à développer ultérieurement.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du service</Label>
              <Input
                value={newServiceName}
                onChange={(e) => setNewServiceName(e.target.value)}
                placeholder="Entrez le nom du service"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddService}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un groupe</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom du groupe</Label>
              <Input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Entrez le nom du groupe"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddGroupe}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isTenueDialogOpen} onOpenChange={setIsTenueDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editTenueId ? "Modifier la tenue" : "Ajouter une tenue"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nom de la tenue</Label>
              <Input
                value={editTenueId ? editTenueName : newTenueName}
                onChange={(e) => editTenueId ? setEditTenueName(e.target.value) : setNewTenueName(e.target.value)}
                placeholder="Entrez le nom de la tenue"
              />
            </div>
            <div className="space-y-2">
              <Label>Description de la tenue</Label>
              <Input
                value={editTenueId ? editTenueDescription : newTenueDescription}
                onChange={(e) => editTenueId ? setEditTenueDescription(e.target.value) : setNewTenueDescription(e.target.value)}
                placeholder="Entrez la description de la tenue"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTenueDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={editTenueId ? handleUpdateTenue : handleAddTenue}>
              {editTenueId ? "Modifier" : "Ajouter"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter un utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Prénom</Label>
              <Input
                value={newUserPrenom}
                onChange={(e) => setNewUserPrenom(e.target.value)}
                placeholder="Entrez le prénom"
              />
            </div>
            <div className="space-y-2">
              <Label>Nom</Label>
              <Input
                value={newUserNom}
                onChange={(e) => setNewUserNom(e.target.value)}
                placeholder="Entrez le nom"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Entrez l'email"
              />
            </div>
            <div className="space-y-2">
              <Label>Mot de passe</Label>
              <Input
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label>Actif</Label>
              <Switch
                checked={newUserActif}
                onCheckedChange={(checked) => setNewUserActif(checked)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddUser}>Ajouter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Parametrages;
