
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Users, Building, Shirt, BarChart3 } from "lucide-react";

const Parametrages = () => {
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
    </div>
  );
};

export default Parametrages;
