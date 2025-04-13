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

type Service = Tables<"services">;

const Parametrages = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newServiceName, setNewServiceName] = useState("");

  // Charger les services
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("nom");

    if (error) {
      console.error("Error fetching services:", error);
      return;
    }

    setServices(data || []);
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
        .from("services")
        .insert([{
          nom: newServiceName.trim(),
          secteur: "Général",
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
  const handleDeleteService = async (serviceId: number) => {
    try {
      const { error } = await supabase
        .from("services")
        .delete()
        .eq("id", serviceId);

      if (error) throw error;

      toast.success("Service supprimé avec succès");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Une erreur est survenue lors de la suppression du service");
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
              <CardTitle>Gestion des utilisateurs</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Gérez les utilisateurs ayant accès à l'application Adaptel Lyon.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">contact@adaptel-lyon.fr</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Rôle:</span>
                        <span className="text-sm font-medium">Admin</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Statut:</span>
                        <span className="text-sm font-medium">Actif</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="groupes">
          <Card>
            <CardHeader>
              <CardTitle>Groupes de clients</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-6">Gérez les groupes permettant de categoriser vos clients.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Restaurants indépendants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">2 clients associés</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Hôtels premium</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">1 client associé</div>
                  </CardContent>
                </Card>
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
                          {service.nom}
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
              <CardTitle>Tenues</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Module de gestion des tenues à développer ultérieurement.
              </p>
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
    </div>
  );
};

export default Parametrages;
