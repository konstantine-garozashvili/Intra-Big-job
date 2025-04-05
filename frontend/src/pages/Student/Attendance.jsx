import React, { useState } from 'react';
import DocumentSignature from '@/components/signature/DocumentSignature';
import SignatureHistory from '@/components/signature/SignatureHistory';
import { Toaster } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardLayout from '@/components/DashboardLayout';
import { motion } from 'framer-motion';
import { PenLine, ClipboardCheck, ClipboardPenLine, CalendarCheck } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

// Variants d'animation
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 15, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  }
};

const Attendance = () => {
  const [activeTab, setActiveTab] = useState("signature");
  
  return (
    <DashboardLayout
      headerIcon={CalendarCheck}
      headerTitle="Enregistrement de présence"
      className="p-0"
    >
      <div className="container mx-auto px-4 py-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-6">
            <Card className="border-none shadow-md">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-t-xl">
                <div className="flex items-center gap-2">
                  <PenLine className="h-5 w-5" />
                  <CardTitle className="text-white">Signature de présence</CardTitle>
                </div>
                <CardDescription className="text-blue-100">
                  Enregistrez votre présence et consultez votre historique
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <Tabs defaultValue="signature" onValueChange={setActiveTab} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="signature" className="flex items-center gap-2">
                      <ClipboardPenLine className="h-4 w-4" />
                      <span>Signer</span>
                    </TabsTrigger>
                    <TabsTrigger value="history" className="flex items-center gap-2">
                      <ClipboardCheck className="h-4 w-4" />
                      <span>Historique</span>
                    </TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="signature">
                    <DocumentSignature />
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <SignatureHistory />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </div>
      
      <Toaster />
    </DashboardLayout>
  );
};

export default Attendance;
