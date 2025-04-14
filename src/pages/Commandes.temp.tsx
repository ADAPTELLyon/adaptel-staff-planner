import React, { useEffect, useState, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Exemple de composant Select pour les clients
export const ClientSelect = ({ commandes, selectedClient, setSelectedClient }) => {
  return (
    <Select value={selectedClient} onValueChange={setSelectedClient}>
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Sélectionner un client" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="">Tous les clients</SelectItem>
        {Array.from(new Set(commandes.map(c => c.client_id))).map((clientId) => {
          const client = commandes.find(c => c.client_id === clientId);
          return (
            <SelectItem key={clientId} value={clientId}>
              {client?.client_nom}
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}; 