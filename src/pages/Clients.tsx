
import { useState, useEffect } from "react";
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
import { Edit, Plus, Search, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SECTEURS } from "@/services/commandesService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Client {
  id: string;
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

// Form schema validation
const formSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(1, { message: "Le nom est requis" }),
  adresse: z.string().optional(),
  ville: z.string().optional(),
  telephone: z.string().optional(),
  email: z.string().email({ message: "Email invalide" }).optional().or(z.literal("")),
  secteur: z.string().optional(),
  groupe_client: z.string().optional(),
  contact_nom: z.string().optional(),
  contact_prenom: z.string().optional(),
  contact_email: z.string().email({ message: "Email de contact invalide" }).optional().or(z.literal("")),
  contact_telephone: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: "",
      nom: "",
      adresse: "",
      ville: "",
      telephone: "",
      email: "",
      secteur: "",
      groupe_client: "",
      contact_nom: "",
      contact_prenom: "",
      contact_email: "",
      contact_telephone: "",
    },
  });

  // Fetch clients from Supabase
  const fetchClients = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      setClients(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des clients:", error);
      toast.error("Erreur lors du chargement des clients");
    } finally {
      setLoading(false);
    }
  };

  // Create or update a client
  const saveClient = async (values: FormValues) => {
    try {
      if (isEditing && values.id) {
        // Update existing client
        const { id, ...clientData } = values;
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", id);
        
        if (error) {
          throw error;
        }
        
        toast.success("Client modifié avec succès");
      } else {
        // Create new client
        const { id, ...clientData } = values;
        const { error } = await supabase
          .from("clients")
          .insert([clientData]);
        
        if (error) {
          throw error;
        }
        
        toast.success("Client créé avec succès");
      }
      
      form.reset();
      setDialogOpen(false);
      setIsEditing(false);
      fetchClients(); // Refresh the client list
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du client:", error);
      toast.error(`Erreur lors de la ${isEditing ? 'modification' : 'création'} du client`);
    }
  };

  // Open edit form with prefilled data
  const handleEdit = (client: Client) => {
    setIsEditing(true);
    form.reset({
      id: client.id,
      nom: client.nom,
      adresse: client.adresse || "",
      ville: client.ville || "",
      telephone: client.telephone || "",
      email: client.email || "",
      secteur: client.secteur || "",
      groupe_client: client.groupe_client || "",
      contact_nom: client.contact_nom || "",
      contact_prenom: client.contact_prenom || "",
      contact_email: client.contact_email || "",
      contact_telephone: client.contact_telephone || "",
    });
    setDialogOpen(true);
  };

  // Handle new client button
  const handleNewClient = () => {
    setIsEditing(false);
    form.reset({
      id: "",
      nom: "",
      adresse: "",
      ville: "",
      telephone: "",
      email: "",
      secteur: "",
      groupe_client: "",
      contact_nom: "",
      contact_prenom: "",
      contact_email: "",
      contact_telephone: "",
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const clientsFiltres = clients.filter(client => 
    client.nom?.toLowerCase().includes(recherche.toLowerCase()) || 
    client.ville?.toLowerCase().includes(recherche.toLowerCase()) ||
    client.secteur?.toLowerCase().includes(recherche.toLowerCase()) ||
    client.email?.toLowerCase().includes(recherche.toLowerCase())
  );

  const onSubmit = (values: FormValues) => {
    saveClient(values);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewClient}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau client
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Modifier le client' : 'Créer un nouveau client'}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Modifiez les informations du client ci-dessous.' 
                  : 'Remplissez le formulaire ci-dessous pour ajouter un nouveau client.'}
              </DialogDescription>
            </DialogHeader>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {isEditing && (
                  <FormField
                    control={form.control}
                    name="id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ID</FormLabel>
                        <FormControl>
                          <Input placeholder="ID" {...field} disabled className="bg-gray-100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du client" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="secteur"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secteur</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                          value={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner un secteur" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SECTEURS.map((secteur) => (
                              <SelectItem key={secteur} value={secteur}>
                                {secteur}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="adresse"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Adresse</FormLabel>
                        <FormControl>
                          <Input placeholder="Adresse" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="ville"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ville</FormLabel>
                        <FormControl>
                          <Input placeholder="Ville" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone</FormLabel>
                        <FormControl>
                          <Input placeholder="Téléphone" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <h3 className="font-medium text-sm pt-2">Contact principal</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom du contact" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom du contact" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contact_telephone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Téléphone contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Téléphone du contact" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email contact</FormLabel>
                        <FormControl>
                          <Input placeholder="Email du contact" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Modifier le client' : 'Créer le client'}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Chargement des clients...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : clientsFiltres.length > 0 ? (
              clientsFiltres.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.nom}</TableCell>
                  <TableCell>{client.ville || "-"}</TableCell>
                  <TableCell>{client.telephone || "-"}</TableCell>
                  <TableCell>{client.email || "-"}</TableCell>
                  <TableCell>{client.secteur ? <Badge variant="outline">{client.secteur}</Badge> : "-"}</TableCell>
                  <TableCell>
                    {client.contact_prenom || client.contact_nom ? 
                      `${client.contact_prenom || ""} ${client.contact_nom || ""}`.trim() : 
                      "-"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(client)}>
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
