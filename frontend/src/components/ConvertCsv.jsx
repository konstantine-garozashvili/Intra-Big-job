// src/components/ConvertCsv.js
import React from "react";
import { toast } from "sonner";
import { Button } from '@/components/ui/button';


function downloadCSV() {
  const table = document.querySelector("table");
  if (!table) {
    toast.error("Aucun tableau trouvée sur la page.");
    return;
  }

  const headers = Array.from(table.querySelectorAll("thead th"))
    .map(th => th.innerText.trim());

  const rows = Array.from(table.querySelectorAll("tbody tr"))
    .map(tr => Array.from(tr.querySelectorAll("td")).map(td => td.innerText.trim()));

  if (headers.length === 0 || rows.length === 0) {
    toast.error("La tableau est vide ou mal formée.");
    return;
  }

  const csvRows = [
    headers.join(","),
    ...rows.map(row => row.map(value => `"${value}"`).join(","))
  ];

  const csvContent = csvRows.join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", "tableau.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  toast.success("Le fichier CSV a été téléchargé.");
}

export default function ConvertCsv() {
  return (
    <Button onClick={() => downloadCSV()} className="no-focus-outline">
  Exporter en CSV
</Button>


  );
}
