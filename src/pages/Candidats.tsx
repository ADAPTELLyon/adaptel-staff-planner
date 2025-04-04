
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
import { Card, CardContent } from "@/components/ui/card";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SECTEURS } from "@/services/commandesService";

interface Candidat {
  id: string;
  nom: string;
  prenom: string;
  email: string | null;
  telephone: string | null;
  vehicule: boolean;
  prioritaire: boolean;
  actif: boolean;
  commentaire: string | null;
  secteurs: string[];
}

const formSchema = z.object({
  id: z.string().optional(),
  nom: z.string().min(1, { message: "Le nom est requis" }),
  prenom: z.string().min(1, { message: "Le prénom est requis" }),
  email: z.string().email({ message: "Email invalide" }).optional().or(z.literal("")),
  telephone: z.string().optional(),
  vehicule: z.boolean().default(false),
  prioritaire: z.boolean().default(false),
  actif: z.boolean().default(true),
  commentaire: z.string().optional(),
  secteurs: z.array(z.string()).default([]),
});

type FormValues = z.infer<typeof formSchema>;

const Candidats = () => {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [loading, setLoading] = useState(true);
  const [recherche, setRecherche] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
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
    },
  });

  // Fetch candidats from Supabase
  const fetchCandidats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("candidats")
        .select("*");
      
      if (error) {
        throw error;
      }
      
      setCandidats(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des candidats:", error);
      toast.error("Erreur lors du chargement des candidats");
    } finally {
      setLoading(false);
    }
  };

  // Create or update a candidat
  const saveCandidat = async (values: FormValues) => {
    try {
      if (isEditing && values.id) {
        // Update existing candidat
        const { id, ...candidatData } = values;
        const { error } = await supabase
          .from("candidats")
          .update(candidatData)
          .eq("id", id);
        
        if (error) {
          throw error;
        }
        
        toast.success("Candidat modifié avec succès");
      } else {
        // Create a new candidat
        const { id, ...candidatData } = values;
        const { error } = await supabase
          .from("candidats")
          .insert([candidatData]);
        
        if (error) {
          throw error;
        }
        
        toast.success("Candidat créé avec succès");
      }
      
      form.reset();
      setDialogOpen(false);
      setIsEditing(false);
      fetchCandidats(); // Refresh candidat list
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du candidat:", error);
      toast.error(`Erreur lors de la ${isEditing ? 'modification' : 'création'} du candidat`);
    }
  };

  // Edit candidat
  const handleEdit = (candidat: Candidat) => {
    setIsEditing(true);
    form.reset({
      id: candidat.id,
      nom: candidat.nom,
      prenom: candidat.prenom,
      email: candidat.email || "",
      telephone: candidat.telephone || "",
      vehicule: candidat.vehicule,
      prioritaire: candidat.prioritaire,
      actif: candidat.actif,
      commentaire: candidat.commentaire || "",
      secteurs: candidat.secteurs || [],
    });
    setDialogOpen(true);
  };

  // Handle new candidat button
  const handleNewCandidat = () => {
    setIsEditing(false);
    form.reset({
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
    });
    setDialogOpen(true);
  };

  useEffect(() => {
    fetchCandidats();
  }, []);

  const candidatsFiltres = candidats.filter(candidat => 
    `${candidat.nom} ${candidat.prenom}`.toLowerCase().includes(recherche.toLowerCase()) || 
    candidat.email?.toLowerCase().includes(recherche.toLowerCase()) ||
    candidat.secteurs?.some(s => s.toLowerCase().includes(recherche.toLowerCase()))
  );

  const onSubmit = (values: FormValues) => {
    saveCandidat(values);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Candidats</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNewCandidat}>
              <Plus className="mr-2 h-4 w-4" />
              Nouveau candidat
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Modifier le candidat' : 'Créer un nouveau candidat'}</DialogTitle>
              <DialogDescription>
                {isEditing 
                  ? 'Modifiez les informations du candidat ci-dessous.' 
                  : 'Remplissez le formulaire ci-dessous pour ajouter un nouveau candidat.'}
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
                    name="prenom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Prénom*</FormLabel>
                        <FormControl>
                          <Input placeholder="Prénom" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="nom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nom*</FormLabel>
                        <FormControl>
                          <Input placeholder="Nom" {...field} />
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
                
                <div className="space-y-2">
                  <h3 className="font-medium text-sm">Secteurs d'activité</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {SECTEURS.map((secteur) => (
                      <FormField
                        key={secteur}
                        control={form.control}
                        name="secteurs"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(secteur)}
                                onCheckedChange={(checked) => {
                                  const updatedValue = checked
                                    ? [...field.value, secteur]
                                    : field.value.filter((value) => value !== secteur);
                                  field.onChange(updatedValue);
                                }}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer text-sm font-normal">
                              {secteur}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="vehicule"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between space-x-3 space-y-0 rounded-md border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-sm font-normal">
                            Véhicule
                          </FormLabel>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="prioritaire"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm font-normal">
                          Prioritaire
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="actif"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <FormLabel className="cursor-pointer text-sm font-normal">
                          Actif
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="commentaire"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Commentaire</FormLabel>
                      <FormControl>
                        <Input placeholder="Commentaire" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter className="pt-4">
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Modifier le candidat' : 'Créer le candidat'}
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
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Chargement des candidats...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : candidatsFiltres.length > 0 ? (
              candidatsFiltres.map((candidat) => (
                <TableRow key={candidat.id} className={!candidat.actif ? "bg-gray-100" : ""}>
                  <TableCell className="font-medium">{`${candidat.prenom} ${candidat.nom}`}</TableCell>
                  <TableCell>{candidat.telephone || "-"}</TableCell>
                  <TableCell>{candidat.email || "-"}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {candidat.secteurs && candidat.secteurs.length > 0 ? candidat.secteurs.map((secteur) => (
                        <Badge key={secteur} variant="outline">{secteur}</Badge>
                      )) : "-"}
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
                    <Button variant="ghost" size="icon" onClick={() => handleEdit(candidat)}>
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
