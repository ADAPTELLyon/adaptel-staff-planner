"use client";

import React, { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import {
  Plus, Edit, Building2, Phone, Mail, MapPin, Calendar, User, Clock, Trash2, Pencil, Save, X
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Parametrage, ClientModification } from "@/integrations/supabase/types";
import { Database } from "@/integrations/supabase/types";

type ContactRow = Database['public']['Tables']['contacts_clients']['Row'];
type ContactInsertType = Database['public']['Tables']['contacts_clients']['Insert'];

interface Client {
  id: string;
  created_at: string;
  updated_at: string;
  actif: boolean;
  nom: string;
  secteur: string;
  service: string | null;
  groupe_client: string | null;
  adresse: string | null;
  ville: string | null;
  telephone: string | null;
  email: string | null;
  contacts: string[] | null;
}

interface Contact {
  id: string;
  nom: string;
  prenom: string;
  fonction: string | null;
  telephone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
}

const SECTEURS = ["Cuisine", "Salle", "Plonge", "Réception", "Étages"];

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [services, setServices] = useState<Parametrage[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [modifications, setModifications] = useState<ClientModification[]>([]);
  const [activeTab, setActiveTab] = useState("informations");
  const [searchQuery, setSearchQuery] = useState("");
  const [formData, setFormData] = useState<Partial<Client>>({
    nom: "",
    secteur: "",
    service: null,
    groupe_client: null,
    adresse: null,
    ville: null,
    telephone: null,
    email: null,
    actif: true,
    contacts: [],
  });
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [contactForm, setContactForm] = useState({
    nom: '',
    prenom: '',
    fonction: '',
    telephone: '',
    email: ''
  });

  useEffect(() => {
    fetchClients();
    fetchServices();
  }, []);

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from("clients")
        .select("*")
        .order("nom");

      if (error) throw error;

      if (data) {
        const clientsData = data.map(client => ({
          ...client,
          actif: client.actif ?? true,
          contacts: client.contacts ?? [],
        }));
        setClients(clientsData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des clients:", error);
      toast.error("Erreur lors du chargement des clients");
    }
  };

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from("parametrages")
        .select("*")
        .eq("categorie", "service");

      if (error) throw error;

      if (data) {
        const servicesData = data.map(service => ({
          id: service.id,
          categorie: service.categorie,
          valeur: service.valeur,
          created_at: service.created_at,
          updated_at: service.updated_at,
        }));
        setServices(servicesData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des services:", error);
      toast.error("Erreur lors du chargement des services");
    }
  };

  const fetchModifications = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from("clients_modifications")
        .select("*")
        .eq("client_id", clientId)
        .order("modifie_le", { ascending: false });

      if (error) throw error;

      if (data) {
        const modificationsData = data.map(modification => ({
          id: modification.id,
          client_id: modification.client_id,
          champ_modifie: modification.champ_modifie,
          ancienne_valeur: modification.ancienne_valeur,
          nouvelle_valeur: modification.nouvelle_valeur,
          modifie_par: modification.modifie_par,
          modifie_le: modification.modifie_le,
        }));
        setModifications(modificationsData);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des modifications:", error);
      toast.error("Erreur lors du chargement des modifications");
    }
  };

  const fetchContacts = async (clientId: string) => {
    try {
      const { data, error } = await supabase
        .from('contacts_clients')
        .select('*')
        .eq('client_id', clientId);

      if (error) throw error;

      if (data) {
        setContacts(data);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des contacts:', error);
      toast.error('Erreur lors du chargement des contacts');
    }
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd MMMM yyyy - HH:mm", { locale: fr });
  };

  const filteredClients = useMemo(() => {
    return clients
      .filter(client => client.actif)
      .filter(client =>
        client.nom.toLowerCase().includes(searchQuery.toLowerCase())
      );
  }, [clients, searchQuery]);

  const handleEditClick = async (client: Client) => {
    setEditingClient(client);
    setFormData({
      nom: client.nom,
      secteur: client.secteur || "",
      service: client.service,
      groupe_client: client.groupe_client,
      adresse: client.adresse,
      ville: client.ville,
      telephone: client.telephone,
      email: client.email,
      actif: client.actif,
      contacts: client.contacts || [],
    });
    await fetchModifications(client.id);
    await fetchContacts(client.id);
    setIsDialogOpen(true);
  };

  const handleCreateClick = async () => {
    setEditingClient(null);
    const newId = await generateClientId();
    setFormData({
      nom: "",
      secteur: "",
      service: null,
      groupe_client: null,
      adresse: null,
      ville: null,
      telephone: null,
      email: null,
      actif: true,
      contacts: [],
      id: newId,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (!formData.nom?.trim() || !formData.secteur) {
        toast.error("Le nom et le secteur sont obligatoires");
        return;
      }

      const clientData = {
        nom: formData.nom.trim(),
        secteur: formData.secteur,
        service: formData.service || null,
        groupe_client: formData.groupe_client || null,
        adresse: formData.adresse || null,
        ville: formData.ville || null,
        telephone: formData.telephone || null,
        email: formData.email || null,
        actif: formData.actif ?? true,
        contacts: contacts.map(contact => contact.id),
        updated_at: new Date().toISOString(),
      };

      if (editingClient) {
        const { error } = await supabase
          .from("clients")
          .update(clientData)
          .eq("id", editingClient.id);

        if (error) throw error;

        toast.success("Client mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from("clients")
          .insert([{
            ...clientData,
            id: formData.id,
            created_at: new Date().toISOString(),
          }]);

        if (error) throw error;

        toast.success("Client créé avec succès");
      }

      await fetchClients();
      setFormData({
        nom: "",
        secteur: "",
        service: null,
        groupe_client: null,
        adresse: null,
        ville: null,
        telephone: null,
        email: null,
        actif: true,
        contacts: [],
      });
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du client:", error);
      toast.error("Erreur lors de la sauvegarde du client");
    }
  };

  const handleAddContact = async (clientId: string) => {
    try {
      const { data: contact, error: contactError } = await supabase
        .from('contacts_clients')
        .insert({
          nom: contactForm.nom,
          prenom: contactForm.prenom,
          fonction: contactForm.fonction || null,
          telephone: contactForm.telephone || null,
          email: contactForm.email || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (contactError) throw contactError;

      if (contact) {
        setContacts([...contacts, contact]);
        toast.success('Contact ajouté avec succès');
        setContactForm({
          nom: '',
          prenom: '',
          fonction: '',
          telephone: '',
          email: ''
        });
        setIsAddingContact(false);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout du contact:', error);
      toast.error('Erreur lors de l\'ajout du contact');
    }
  };

  const handleUpdateContact = async (contact: Contact) => {
    try {
      const updateData = {
        nom: contact.nom,
        prenom: contact.prenom,
        fonction: contact.fonction,
        telephone: contact.telephone,
        email: contact.email,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('contacts_clients')
        .update(updateData)
        .eq('id', contact.id);

      if (error) throw error;

      setContacts(prevContacts => 
        prevContacts.map(c => c.id === contact.id ? { ...c, ...updateData } : c)
      );
      setEditingContact(null);
      toast.success('Contact mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contact:', error);
      toast.error('Erreur lors de la mise à jour du contact');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    try {
      // Supprimer le contact de la table contacts_clients
      const { error: contactError } = await supabase
        .from('contacts_clients')
        .delete()
        .eq('id', contactId);

      if (contactError) throw contactError;

      // Mettre à jour le client en retirant l'ID du contact
      const { error: clientError } = await supabase
        .from('clients')
        .update({
          contacts: selectedClient?.contacts?.filter(id => id !== contactId) || [],
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedClient?.id);

      if (clientError) throw clientError;

      // Mettre à jour l'état local
      setContacts(contacts.filter(c => c.id !== contactId));
      setClients(clients.map(c => {
        if (c.id === selectedClient?.id) {
          return {
            ...c,
            contacts: c.contacts?.filter(id => id !== contactId) || []
          };
        }
        return c;
      }));

      toast.success('Contact supprimé avec succès');
    } catch (error) {
      console.error('Erreur lors de la suppression du contact:', error);
      toast.error('Erreur lors de la suppression du contact');
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
                      {client.service && (
                        <Badge variant="secondary" className="capitalize">
                          {client.service}
                        </Badge>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {client.contacts && client.contacts.length > 0 && contacts.find(c => c.id === client.contacts[0])?.nom} {client.contacts && client.contacts.length > 0 && contacts.find(c => c.id === client.contacts[0])?.prenom}
                    </div>
                    <div className="text-sm text-gray-500">
                      {client.contacts && client.contacts.length > 0 && contacts.find(c => c.id === client.contacts[0])?.telephone}
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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="informations">Informations</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
              <TabsTrigger value="historique">Historique</TabsTrigger>
            </TabsList>
            
            <TabsContent value="informations">
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Informations de base</h3>
                    <div className="grid grid-cols-2 gap-4">
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
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              secteur: value
                            }));
                          }}
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
                          value={formData.service || ""}
                          onValueChange={(value) => {
                            setFormData(prev => ({
                              ...prev,
                              service: value || null
                            }));
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un service" />
                          </SelectTrigger>
                          <SelectContent>
                            {services.map((service) => (
                              <SelectItem 
                                key={service.id} 
                                value={service.valeur}
                              >
                                {service.valeur}
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

                  {/* Statut */}
                  <div className="space-y-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={formData.actif ?? true}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, actif: checked })
                        }
                      />
                      <span className="text-sm font-medium">
                        {formData.actif ? "Client activé" : "Client désactivé"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Un client désactivé n'apparaîtra plus dans les listes et sélections.
                    </p>
                  </div>

                  {/* Infos système */}
                  {editingClient && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Informations système</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Date de création</Label>
                          <Input value={formatDate(editingClient.created_at)} disabled />
                        </div>
                        <div className="space-y-2">
                          <Label>Dernière mise à jour</Label>
                          <Input value={formatDate(editingClient.updated_at)} disabled />
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
            </TabsContent>

            <TabsContent value="contact">
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Contacts</h3>
                  <div className="space-y-4">
                    {contacts.length === 0 && !isAddingContact ? (
                      <div className="text-center py-8 border-2 border-dashed rounded-lg">
                        <p className="text-gray-500 mb-4">Aucun contact n'a été ajouté</p>
                        <Button
                          variant="outline"
                          onClick={() => setIsAddingContact(true)}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter un premier contact
                        </Button>
                      </div>
                    ) : (
                      <>
                        {contacts.map((contact) => (
                          <Card key={contact.id} className="p-4">
                            <div className="flex justify-between items-start">
                              <div className="space-y-2">
                                <div className="font-medium">
                                  {contact.nom} {contact.prenom}
                                </div>
                                {contact.fonction && (
                                  <div className="text-sm text-gray-500">{contact.fonction}</div>
                                )}
                                <div className="text-sm text-gray-500">
                                  {contact.telephone && (
                                    <div className="flex items-center">
                                      <Phone className="h-4 w-4 mr-2" />
                                      {contact.telephone}
                                    </div>
                                  )}
                                  {contact.email && (
                                    <div className="flex items-center">
                                      <Mail className="h-4 w-4 mr-2" />
                                      {contact.email}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingContact(contact)}
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteContact(contact.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}

                        {isAddingContact && (
                          <Card className="p-4">
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <h4 className="font-medium">Nouveau contact</h4>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setIsAddingContact(false)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Nom</Label>
                                  <Input
                                    value={contactForm.nom}
                                    onChange={(e) => setContactForm({ ...contactForm, nom: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Prénom</Label>
                                  <Input
                                    value={contactForm.prenom}
                                    onChange={(e) => setContactForm({ ...contactForm, prenom: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Fonction</Label>
                                  <Input
                                    value={contactForm.fonction}
                                    onChange={(e) => setContactForm({ ...contactForm, fonction: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Téléphone</Label>
                                  <Input
                                    value={contactForm.telephone}
                                    onChange={(e) => setContactForm({ ...contactForm, telephone: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2 col-span-2">
                                  <Label>Email</Label>
                                  <Input
                                    type="email"
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setIsAddingContact(false)}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  onClick={() => handleAddContact(selectedClient?.id || '')}
                                  disabled={!contactForm.nom || !contactForm.prenom}
                                >
                                  Ajouter
                                </Button>
                              </div>
                            </div>
                          </Card>
                        )}

                        {!isAddingContact && (
                          <Button
                            variant="outline"
                            onClick={() => setIsAddingContact(true)}
                            className="w-full"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Ajouter un contact
                          </Button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="historique">
              <div className="space-y-4">
                <h3 className="font-medium">Historique des modifications</h3>
                <div className="space-y-2">
                  {modifications.length > 0 ? (
                    modifications.map((modification) => (
                      <div
                        key={modification.id}
                        className="p-4 border rounded-lg bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {modification.champ_modifie === "creation"
                                ? "Création du client"
                                : `Modification du champ ${modification.champ_modifie}`}
                            </p>
                            <p className="text-sm text-gray-500">
                              {formatDate(modification.modifie_le)}
                            </p>
                          </div>
                          <p className="text-sm text-gray-500">
                            Par {modification.modifie_par}
                          </p>
                        </div>
                        {modification.champ_modifie !== "creation" && (
                          <div className="mt-2 text-sm">
                            <p>
                              <span className="font-medium">Ancienne valeur:</span>{" "}
                              {modification.ancienne_valeur || "Non définie"}
                            </p>
                            <p>
                              <span className="font-medium">Nouvelle valeur:</span>{" "}
                              {modification.nouvelle_valeur || "Non définie"}
                            </p>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">
                      Aucune modification enregistrée
                    </p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {editingContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Modifier le contact</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nom</label>
                <input
                  type="text"
                  value={editingContact.nom}
                  onChange={(e) => setEditingContact({ ...editingContact, nom: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Prénom</label>
                <input
                  type="text"
                  value={editingContact.prenom}
                  onChange={(e) => setEditingContact({ ...editingContact, prenom: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fonction</label>
                <input
                  type="text"
                  value={editingContact.fonction || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, fonction: e.target.value || null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Téléphone</label>
                <input
                  type="text"
                  value={editingContact.telephone || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, telephone: e.target.value || null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  value={editingContact.email || ""}
                  onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value || null })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingContact(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={() => handleUpdateContact(editingContact)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clients;
