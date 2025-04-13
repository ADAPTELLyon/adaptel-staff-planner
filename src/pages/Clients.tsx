"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Plus, Edit, Building2, Phone, Mail, MapPin, Calendar, User, Clock
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const SECTEURS = ["Cuisine", "Salle", "Plonge", "Réception", "Étages"];

type Client = Tables<"clients">;
type Service = Tables<"services">;

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState<Partial<Client>>({
    nom: "",
    secteur: "Cuisine",
    service_id: null,
    groupe_client: "",
    contact_nom: "",
    contact_prenom: "",
    contact_telephone: "",
    contact_email: "",
    adresse: "",
    ville: "",
    telephone: "",
    email: "",
  });

  // Charger les clients et services
  useEffect(() => {
    const fetchData = async () => {
      // Charger les clients
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("nom");

      if (clientsError) {
        console.error("Error fetching clients:", clientsError);
        return;
      }

      setClients(clientsData || []);

      // Charger les services
      const { data: servicesData, error: servicesError } = await supabase
        .from("services")
        .select("*")
        .order("nom");

      if (servicesError) {
        console.error("Error fetching services:", servicesError);
        return;
      }

      setServices(servicesData || []);
    };

    fetchData();
  }, []);

  // Générer un ID client unique
  const generateClientId = async () => {
    const { data: lastClient } = await supabase
      .from("clients")
      .select("id")
      .order("id", { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (lastClient && lastClient.length > 0) {
      const lastId = lastClient[0].id;
      const lastNumber = parseInt(lastId.split("_")[1]);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    return `CL_${nextNumber.toString().padStart(4, "0")}`;
  };

  // Filtrer les clients
  const filteredClients = useMemo(() => {
    return clients.filter(client =>
      client.nom.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [clients, searchQuery]);

  // Filtrer les services par secteur
  const filteredServices = useMemo(() => {
    return services.filter(service => service.secteur === formData.secteur);
  }, [services, formData.secteur]);

  // Gérer l'ouverture de la modale d'édition
  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setFormData({
      ...client,
    });
    setIsDialogOpen(true);
  };

  // Gérer l'ouverture de la modale de création
  const handleCreateClick = async () => {
    setEditingClient(null);
    const newId = await generateClientId();
    setFormData({
      nom: "",
      secteur: "Cuisine",
      service_id: null,
      groupe_client: "",
      contact_nom: "",
      contact_prenom: "",
      contact_telephone: "",
      contact_email: "",
      adresse: "",
      ville: "",
      telephone: "",
      email: "",
      id: newId,
    });
    setIsDialogOpen(true);
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom) {
      toast.error("Le nom du client est obligatoire");
      return;
    }

    try {
      const now = new Date().toISOString();

      if (editingClient) {
        // Mise à jour d'un client existant
        const { error } = await supabase
          .from("clients")
          .update({
            ...formData,
            updated_at: now,
          })
          .eq("id", editingClient.id);

        if (error) throw error;

        toast.success("Client mis à jour avec succès");
      } else {
        // Création d'un nouveau client
        const { error } = await supabase
          .from("clients")
          .insert([{
            ...formData,
            nom: formData.nom || "",
            created_at: now,
            updated_at: now,
          }]);

        if (error) throw error;

        toast.success("Client créé avec succès");
      }

      // Rafraîchir les données
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .order("nom");

      if (clientsError) throw clientsError;

      setClients(clientsData || []);
      setIsDialogOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error("Error saving client:", error);
      toast.error("Une erreur est survenue lors de la sauvegarde du client");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clients</h1>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter un client
        </Button>
      </div>

      <div className="mb-6">
        <Input
          placeholder="Rechercher un client..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Secteur & Service
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredClients.map((client) => {
              const clientService = services.find(s => s.id === client.service_id);
              return (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {client.nom}
                        </div>
                        {client.groupe_client && (
                          <div className="text-sm text-gray-500">
                            {client.groupe_client}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-2">
                      {client.secteur && (
                        <Badge variant="outline" className="capitalize">
                          {client.secteur}
                        </Badge>
                      )}
                      {clientService && (
                        <Badge variant="secondary" className="capitalize">
                          {clientService.nom}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {client.contact_nom} {client.contact_prenom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.contact_telephone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditClick(client)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingClient ? "Modifier le client" : "Nouveau client"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Informations de base */}
              <div className="space-y-4">
                <h3 className="font-medium">Informations de base</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>ID client</Label>
                    <Input
                      value={formData.id || "Généré automatiquement"}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Nom du client *</Label>
                    <Input
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secteur *</Label>
                    <Select
                      value={formData.secteur || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, secteur: value, service_id: null })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner un secteur" />
                      </SelectTrigger>
                      <SelectContent>
                        {SECTEURS.map((secteur) => (
                          <SelectItem key={secteur} value={secteur}>
                            {secteur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Service</Label>
                    <Select
                      value={formData.service_id?.toString() || ""}
                      onValueChange={(value) =>
                        setFormData({ ...formData, service_id: value ? parseInt(value) : null })
                      }
                      disabled={!formData.secteur || filteredServices.length === 0}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={filteredServices.length === 0 ? "Aucun service disponible" : "Sélectionner un service"} />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredServices.map((service) => (
                          <SelectItem key={service.id} value={service.id.toString()}>
                            {service.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Groupe client</Label>
                    <Input
                      value={formData.groupe_client || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, groupe_client: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-4">
                <h3 className="font-medium">Contact</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Nom du contact</Label>
                    <Input
                      value={formData.contact_nom || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_nom: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Prénom du contact</Label>
                    <Input
                      value={formData.contact_prenom || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_prenom: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone</Label>
                    <Input
                      value={formData.contact_telephone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_telephone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.contact_email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Coordonnées établissement */}
              <div className="space-y-4">
                <h3 className="font-medium">Coordonnées établissement</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Adresse</Label>
                    <Input
                      value={formData.adresse || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, adresse: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Ville</Label>
                    <Input
                      value={formData.ville || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, ville: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Téléphone établissement</Label>
                    <Input
                      value={formData.telephone || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email établissement</Label>
                    <Input
                      type="email"
                      value={formData.email || ""}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Infos système */}
              {editingClient && (
                <div className="space-y-4">
                  <h3 className="font-medium">Informations système</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Date de création</Label>
                      <Input value={editingClient.created_at} disabled />
                    </div>
                    <div className="space-y-2">
                      <Label>Dernière mise à jour</Label>
                      <Input value={editingClient.updated_at} disabled />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={!formData.nom}>
                {editingClient ? "Enregistrer" : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Clients;
