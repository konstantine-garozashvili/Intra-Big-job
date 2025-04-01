import React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Smartphone,
  Laptop,
  LogOut,
  MonitorSmartphone as DevicesIcon,
} from 'lucide-react';

const ConnectedDevicesCard = ({ devices = [], onDisconnect }) => {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-950 dark:to-amber-950">
        <div className="flex items-center">
          <DevicesIcon className="h-5 w-5 mr-2 text-orange-600 dark:text-orange-400" />
          <CardTitle className="text-lg">Périphériques connectés</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {devices && devices.length > 0 ? (
          <div className="space-y-4">
            {devices.map((device) => (
              <div 
                key={device.id} 
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center">
                  {device.type === 'mobile' ? (
                    <Smartphone className="h-8 w-8 mr-3 text-gray-500" />
                  ) : (
                    <Laptop className="h-8 w-8 mr-3 text-gray-500" />
                  )}
                  <div>
                    <p className="font-medium">{device.name}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Dernière connexion: {new Date(device.lastLogin).toLocaleString()}
                      </p>
                      {device.isCurrentDevice && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          Appareil actuel
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {!device.isCurrentDevice && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/30"
                    onClick={() => onDisconnect(device.id)}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <DevicesIcon className="h-12 w-12 mx-auto text-gray-300" />
            <p className="mt-2 text-gray-500 dark:text-gray-400">Aucun périphérique connecté</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Les appareils connectés à votre compte apparaîtront ici
            </p>
          </div>
        )}

        {devices && devices.length > 0 && (
          <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Vous êtes connecté sur {devices.length} appareil{devices.length > 1 ? 's' : ''}
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:border-red-800 dark:hover:border-red-700"
              onClick={() => onDisconnect('all')}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Déconnecter tous les appareils
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConnectedDevicesCard; 