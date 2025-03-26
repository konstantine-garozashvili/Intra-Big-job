import React from 'react';
import { ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import PageTransition from '@/components/PageTransition';
import Calendar from './Calendar';

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (custom) => ({
        opacity: 1,
        y: 0,
        transition: {
            delay: custom * 0.1,
            duration: 0.5,
            ease: "easeOut",
        },
    }),
};

const Schedule = () => {
    return (
        <PageTransition>
            <div className="min-h-screen py-8 bg-gray-50 dark:bg-gray-900">
                <div className="container p-6 mx-auto">
                    <motion.div
                        className="flex items-center justify-between mb-8"
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                    >
                        <div>
                            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                                Emploi du temps
                            </h1>
                        </div>
                        <Link to="/admin/dashboard">
                            <Button variant="outline" className="flex items-center gap-2 transition-all duration-200 border-2 rounded-full hover:bg-gray-100">
                                <ArrowLeft className="w-4 h-4" />
                                Retour
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.div
                        custom={0}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <Calendar />
                    </motion.div>
                </div>
            </div>
        </PageTransition>
    );
};

export default Schedule;