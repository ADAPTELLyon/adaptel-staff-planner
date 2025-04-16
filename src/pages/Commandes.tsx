// ✅ Fichier complet Commandes.tsx avec section fixe et tableau corrigé et moderne selon les directives

"use client";

import React, { useEffect, useState, useMemo } from "react";
import { fetchCommandesForWeek, calculateIndicators, getStatusColors } from "@/services/commandesService";
import { CommandeAvecJours } from "@/integrations/supabase/types";
import {
  Edit, Plus, ChefHat, UtensilsCrossed, Bed, Bell, GlassWater, Share2, Check, PlusCircle
} from "lucide-react";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import CommandeForm from "@/components/commandes/CommandeForm";
import NotificationBadge from "@/components/commandes/NotificationBadge";
import { Layout } from "@/components/layout/Layout";

const joursSemaine = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];


const SECTEURS = ["Cuisine", "Salle", "Plonge", "Réception", "Étages"];

const Commandes = () => {
  const [commandes, setCommandes] = useState<CommandeAvecJours[]>([]);
  const [selectedSemaine, setSelectedSemaine] = useState("14");
  const [selectedSecteur, setSelectedSecteur] = useState("Étages");
  const [selectedClient, setSelectedClient] = useState<string>("tous");
  const [currentWeek, setCurrentWeek] = useState(true);
  const [inSearch, setInSearch] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [newCommandeDialogOpen, setNewCommandeDialogOpen] = useState(false);

  // Fonction pour obtenir la semaine actuelle
  const getCurrentWeek = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil(diff / oneWeek).toString();
  };

  // Effet pour gérer la synchronisation des filtres
  useEffect(() => {
    if (showAll) {
      setCurrentWeek(false);
      setInSearch(false);
      setSelectedSecteur("Tous");
      setSearchQuery("");
    } else {
      setCurrentWeek(true);
      setSelectedSecteur("Cuisine");
      setSelectedSemaine(getCurrentWeek());
      setSearchQuery("");
    }
  }, [showAll]);

  // Effet pour gérer la synchronisation de la semaine en cours
  useEffect(() => {
    if (currentWeek) {
      setSelectedSemaine(getCurrentWeek());
    }
  }, [currentWeek]);

  // Effet pour gérer la désactivation de "Semaine en cours" lors du changement de semaine
  useEffect(() => {
    if (selectedSemaine !== getCurrentWeek()) {
      setCurrentWeek(false);
    }
  }, [selectedSemaine]);

  const fetchCommandes = async () => {
    const result = await fetchCommandesForWeek(parseInt(selectedSemaine), 2025);
    setCommandes(result);
  };

  useEffect(() => {
    fetchCommandes();
  }, [selectedSemaine]);

  // Effet pour réinitialiser le client sélectionné quand on active "Tout afficher"
  useEffect(() => {
    if (showAll) {
      setSelectedClient("tous");
    }
  }, [showAll]);

  const filteredCommandes = useMemo(() => {
    return commandes.filter((commande) => {
      const matchSecteur = showAll || commande.secteur === selectedSecteur;
      const matchSearch = searchQuery === "" || commande.client_nom.toLowerCase().includes(searchQuery.toLowerCase());
      const matchRecherche = !inSearch || commande.jours?.some(j => j.statut === "En recherche");
      const matchClient = selectedClient === "tous" || commande.client_id === selectedClient;
      return matchSecteur && matchSearch && matchRecherche && matchClient;
    });
  }, [commandes, selectedSecteur, showAll, searchQuery, inSearch, selectedClient]);

  // Calculer la liste des clients uniques
  const uniqueClients = useMemo(() => {
    const clientsMap = new Map();
    commandes.forEach(commande => {
      if (!clientsMap.has(commande.client_id)) {
        clientsMap.set(commande.client_id, commande.client_nom);
      }
    });
    return Array.from(clientsMap.entries()).map(([id, nom]) => ({ id, nom }));
  }, [commandes]);

  const indicateurs = useMemo(() => calculateIndicators(filteredCommandes), [filteredCommandes]);
  const missionsTotal = indicateurs.find(i => i.nom === "Demandées")?.valeur || 0;
  const missionsValidees = indicateurs.find(i => i.nom === "Validées")?.valeur || 0;
  const progressValue = missionsTotal === 0 ? 0 : Math.round((missionsValidees / missionsTotal) * 100);
  const isComplete = progressValue >= 100;

  const getFormattedDate = (dayIndex: number) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const firstDay = new Date(year, 0, 1 + (parseInt(selectedSemaine) - 1) * 7);
    const date = new Date(firstDay.setDate(firstDay.getDate() - firstDay.getDay() + 1 + dayIndex));
    return `${joursSemaine[dayIndex]} ${date.getDate()} ${date.toLocaleString("default", { month: "long" })}`;
  };

  const getEnRechercheCountByDay = (dayIndex: number) => {
    return filteredCommandes.reduce((acc, commande) => {
      const jour = commande.jours?.find(j => j.jour_semaine === dayIndex + 1);
      return jour?.statut === "En recherche" ? acc + 1 : acc;
    }, 0);
  };

  return (
    <Layout>
      <div className="p-6 bg-[#f8f8f8] min-h-screen">
        {/* SECTION FIXE */}
        <div className="fixed top-16 left-0 right-0 bg-white border-b shadow-lg p-6 z-30">
          <div className="max-w-[calc(100vw-3rem)] mx-auto">
            <div className="flex items-center justify-start gap-4 flex-wrap">
              {indicateurs.map((ind) => (
                <Card key={ind.nom} className="shadow-md w-[150px]" style={{ backgroundColor: ind.couleur }}>
                  <CardContent className="py-4 px-3">
                    <div className="text-sm font-semibold">{ind.nom}</div>
                    <div className="text-2xl font-bold">{ind.valeur}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="w-[620px] mt-4">
              <div className="relative bg-white rounded-md h-6 border">
                <div className={`h-full rounded-md absolute top-0 left-0 ${isComplete ? "bg-[#4CAF50] w-full" : "bg-[#f1c232]"}`} style={{ width: `${progressValue}%` }}></div>
                <div className="absolute inset-0 flex items-center justify-center text-sm font-semibold">
                  {isComplete ? "Complet" : `${progressValue}%`}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 flex-wrap mt-4">
              {SECTEURS.map((secteur) => (
                <Button 
                  key={secteur} 
                  variant={selectedSecteur === secteur ? "default" : "outline"} 
                  className={`w-[130px] justify-start ${selectedSecteur === secteur ? "bg-[#840404] text-white" : ""}`} 
                  onClick={() => !showAll && setSelectedSecteur(secteur)}
                  disabled={showAll}
                >
                  {secteur}
                </Button>
              ))}
              <div className="w-px h-10 bg-gray-300 mx-2"></div>
              <Select value={selectedSemaine} onValueChange={setSelectedSemaine}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Semaine" />
                </SelectTrigger>
                <SelectContent>
                  {["14", "15", "16"].map((week) => (
                    <SelectItem key={week} value={week}>Semaine {week}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select 
                value={selectedClient} 
                onValueChange={setSelectedClient}
                disabled={showAll}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sélectionner un client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tous">Tous les clients</SelectItem>
                  {uniqueClients.map(client => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.nom}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-6 mt-4">
              {[
                { 
                  id: "semaine-courante", 
                  label: "Semaine en cours", 
                  checked: currentWeek, 
                  onChange: setCurrentWeek,
                  disabled: showAll
                }, 
                { 
                  id: "en-recherche", 
                  label: "En recherche", 
                  checked: inSearch, 
                  onChange: setInSearch,
                  disabled: showAll
                }, 
                { 
                  id: "tout-afficher", 
                  label: "Tout afficher", 
                  checked: showAll, 
                  onChange: setShowAll
                }
              ].map((item) => (
                <div key={item.id} className="flex items-center space-x-2">
                  <Switch 
                    id={item.id} 
                    checked={item.checked} 
                    onCheckedChange={item.onChange} 
                    className="data-[state=checked]:bg-[#840404]"
                    disabled={item.disabled}
                  />
                  <label htmlFor={item.id} className="text-sm">{item.label}</label>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex gap-2">
                <Button 
                  className="bg-[#840404] text-white"
                  onClick={() => setNewCommandeDialogOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-1" /> Nouvelle commande
                </Button>
                <Button variant="outline">Saisir disponibilités</Button>
                <Button variant="outline">Saisir incident</Button>
              </div>
              <Input placeholder="Rechercher un client ou un candidat..." className="w-[240px]" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>
        </div>

        {/* SECTION TABLEAU */}
        <div className="mt-[calc(20rem+1px)]">
          <section className="bg-white border rounded-xl shadow-lg p-6">
            <div className="relative">
              {/* EN-TÊTE FIXE */}
              <div className="sticky top-[calc(20rem+1px)] z-20">
                <div className="grid grid-cols-[250px_repeat(7,_minmax(0,_1fr))] min-w-full">
                  <div className="bg-gray-800 text-white text-center font-semibold py-3 border-r">Semaine {selectedSemaine}</div>
                  {joursSemaine.map((jour, i) => (
                    <div key={i} className="bg-gray-800 text-white text-center font-semibold py-3 border-r relative">
                      <div className="mb-2">{getFormattedDate(i)}</div>
                      <div className="absolute -top-4 right-3 z-10">
                        {getEnRechercheCountByDay(i) > 0 ? (
                          <div className="bg-[#ffe599] text-black text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                            {getEnRechercheCountByDay(i)}
                          </div>
                        ) : (
                          <div className="bg-[#d9ead3] text-green-800 text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center shadow-sm">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* CONTENU DU TABLEAU */}
              <div className="overflow-y-auto max-h-[calc(100vh-20rem)]">
                <div className="grid grid-cols-[250px_repeat(7,_minmax(0,_1fr))] min-w-full">
                  {filteredCommandes.map((commande, rowIdx) => (
                    <React.Fragment key={commande.id}>
                      <div className="bg-white border-b border-r p-3 sticky left-0 z-10">
                        <div className="flex justify-between items-center">
                          <div className="font-medium text-sm">{commande.client_nom}</div>
                          <Edit className="w-4 h-4 text-gray-500" />
                        </div>
                        {commande.secteur && (
                          <Badge 
                            variant="outline" 
                            className="mt-1.5 bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            {commande.secteur === "Cuisine" && <ChefHat className="w-3.5 h-3.5 mr-1.5" />}
                            {commande.secteur === "Salle" && <UtensilsCrossed className="w-3.5 h-3.5 mr-1.5" />}
                            {commande.secteur === "Étages" && <Bed className="w-3.5 h-3.5 mr-1.5" />}
                            {commande.secteur === "Plonge" && <GlassWater className="w-3.5 h-3.5 mr-1.5" />}
                            {commande.secteur === "Réception" && <Bell className="w-3.5 h-3.5 mr-1.5" />}
                            {commande.secteur}
                          </Badge>
                        )}
                        <div className="flex justify-between items-center text-xs mt-1">
                          <span>Semaine {commande.semaine}</span>
                          <div className="flex items-center gap-1">
                            <Share2 className="w-4 h-4 text-gray-400" />
                            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          </div>
                        </div>
                      </div>
                      {joursSemaine.map((_, jIdx) => {
                        const jour = commande.jours?.find(j => j.jour_semaine === jIdx + 1);
                        const couleur = jour ? getStatusColors(jour.statut === "Validé" ? "Validé" : jour.statut) : getStatusColors("Vide");
                        return (
                          <div key={jIdx} className="bg-white border-b p-1">
                            <div className="rounded-lg px-2 py-2 h-full w-full text-xs" style={{ backgroundColor: couleur.couleur_fond, color: couleur.couleur_texte }}>
                              {jour ? (
                                <div className="h-full flex flex-col min-h-[80px]">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      {jour.statut === "Validé" ? (
                                        <>
                                          <div className="text-sm font-medium truncate">{jour.candidat?.split(' ')[0]}</div>
                                          <div className="text-sm font-medium truncate">{jour.candidat?.split(' ').slice(1).join(' ')}</div>
                                        </>
                                      ) : (
                                        <div className="text-sm font-medium truncate">{jour.statut}</div>
                                      )}
                                    </div>
                                    <PlusCircle className="w-4 h-4 text-black opacity-60 flex-shrink-0" />
                                  </div>
                                  <div className="flex-1 flex flex-col justify-center space-y-1 mt-1">
                                    {jour.creneaux?.[0] ? (
                                      <div className="flex justify-between items-center text-xs font-mono">
                                        <span>{jour.creneaux[0].split(' - ')[0]}</span>
                                        <span>{jour.creneaux[0].split(' - ')[1]}</span>
                                      </div>
                                    ) : (
                                      <div className="text-xs font-mono">-</div>
                                    )}
                                    {jour.creneaux?.[1] ? (
                                      <div className="flex justify-between items-center text-xs font-mono">
                                        <span>{jour.creneaux[1].split(' - ')[0]}</span>
                                        <span>{jour.creneaux[1].split(' - ')[1]}</span>
                                      </div>
                                    ) : (
                                      <div className="text-xs font-mono">-</div>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="h-full flex items-center justify-center min-h-[80px] text-gray-400">-</div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        <Dialog open={newCommandeDialogOpen} onOpenChange={(open) => {
          setNewCommandeDialogOpen(open);
          if (!open) {
            fetchCommandes();
          }
        }}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Nouvelle commande</DialogTitle>
            </DialogHeader>
            <CommandeForm onClose={() => setNewCommandeDialogOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
};

export default Commandes;
