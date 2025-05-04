import React from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock } from "lucide-react";

const FormationCard = ({ formation, onRequestJoin, viewMode }) => {
  const {
    name,
    promotion,
    image_url,
    capacity,
    duration,
    dateStart,
    description
  } = formation;

  return (
    <Card className={`
      h-full flex flex-col bg-card
      ${viewMode === 'grid' ? 'w-full' : 'w-full'}
      transition-all duration-200 hover:shadow-lg
    `}>
      <div className="relative w-full">
        <img
          src={image_url || '/placeholder-formation.jpg'}
          alt={name}
          className={`w-full object-cover ${viewMode === 'grid' ? 'h-48' : 'h-64'}`}
        />
      </div>

      <div className="flex flex-col flex-grow p-4 space-y-4">
        <div>
          <h3 className="text-xl font-semibold line-clamp-1 mb-2">
            {name}
          </h3>
          
          <Badge variant="secondary" className="text-sm">
            {promotion}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{capacity} places</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{duration} mois</span>
          </div>
          <div className="flex items-center gap-1 col-span-2">
            <Calendar className="w-4 h-4" />
            <span>{new Date(dateStart).toLocaleDateString()}</span>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
          {description}
        </p>

        <Button 
          variant="default"
          className="w-full mt-auto"
          onClick={() => onRequestJoin(formation.id)}
        >
          Demander à rejoindre
        </Button>
      </div>
    </Card>
  );
};

export default FormationCard; 