import React, { useState, useEffect } from 'react';
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter,
    DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
    Alert,
    AlertDescription,
    AlertTitle
} from '@/components/ui/alert';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
    Loader2, 
    User, 
    Mail, 
    Phone, 
    Calendar, 
    AlertTriangle, 
    Ban, 
    Check, 
    X,
    UserCog
} from 'lucide-react';
import { format, parse, isValid } from 'date-fns';
import { PhoneInput } from '@/components/ui/phone-input';
import { isValidPhone } from '@/lib/utils/validation';

const EditUserDialog = ({ 
    isOpen, 
    onClose, 
    user, 
    onUpdateUser, 
    isProcessing, 
    currentUserIsSuperAdmin,
    isDark
}) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        birthDate: ''
    });
    
    const [errors, setErrors] = useState({});
    const [formChanged, setFormChanged] = useState(false);

    // Initialiser le formulaire avec les données utilisateur quand il est sélectionné
    useEffect(() => {
        if (user) {
            const initialData = {
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                birthDate: user.birthDate 
                    ? format(new Date(user.birthDate), 'yyyy-MM-dd')
                    : ''
            };
            setFormData(initialData);
            setFormChanged(false);
        }
    }, [user]);

    // Generate avatar initials
    const getInitials = (firstName, lastName) => {
        return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const currentValue = formData[name];
        
        // Only set formChanged if the value actually changed
        if (currentValue !== value) {
            setFormChanged(true);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Clear error when field is changed
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    const handlePhoneChange = (value) => {
        const currentValue = formData.phoneNumber;
        
        // Only set formChanged if the value actually changed
        if (currentValue !== value) {
            setFormChanged(true);
        }
        
        setFormData(prev => ({
            ...prev,
            phoneNumber: value
        }));
        
        // Clear error when field is changed
        if (errors.phoneNumber) {
            setErrors(prev => ({
                ...prev,
                phoneNumber: null
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};
        
        // Required fields
        if (!formData.firstName.trim()) {
            newErrors.firstName = 'Le prénom est requis';
        }
        
        if (!formData.lastName.trim()) {
            newErrors.lastName = 'Le nom est requis';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!formData.email.trim()) {
            newErrors.email = 'L\'email est requis';
        } else if (!emailRegex.test(formData.email)) {
            newErrors.email = 'Email invalide';
        }
        
        // Phone number validation (optional)
        if (formData.phoneNumber && !isValidPhone(formData.phoneNumber)) {
            newErrors.phoneNumber = 'Numéro de téléphone invalide';
        }
        
        // Birth date validation (optional)
        if (formData.birthDate) {
            const parsedDate = parse(formData.birthDate, 'yyyy-MM-dd', new Date());
            if (!isValid(parsedDate)) {
                newErrors.birthDate = 'Date de naissance invalide';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }
        
        // Préparer les données pour l'API
        const userData = {
            ...formData,
            birthDate: formData.birthDate 
                ? format(parse(formData.birthDate, 'yyyy-MM-dd', new Date()), 'yyyy-MM-dd')
                : null
        };
        
        onUpdateUser(user.id, userData);
    };

    // Vérifier si l'utilisateur est un SuperAdmin et si l'utilisateur actuel n'est pas SuperAdmin
    const isSuperAdminAndCurrentUserIsNot = user?.roles?.some(role => 
        (role.name === 'SUPERADMIN' || role.name === 'ROLE_SUPERADMIN')) && !currentUserIsSuperAdmin;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className={`sm:max-w-[550px] ${isDark ? 'bg-gray-800 border-gray-700' : ''}`}>
                <DialogHeader className={`px-6 pt-6 pb-2 ${isDark ? 'text-gray-100' : ''}`}>
                    <DialogTitle className={`text-xl font-semibold flex items-center gap-2 ${isDark ? 'text-gray-100' : ''}`}>
                        <UserCog className={`h-5 w-5 ${isDark ? 'text-blue-400' : 'text-blue-600'}`} />
                        Modifier l'utilisateur
                    </DialogTitle>
                    <DialogDescription className={`text-gray-500 mt-1.5 ${isDark ? 'text-gray-400' : ''}`}>
                        Mettez à jour les informations de l'utilisateur ici.
                    </DialogDescription>
                </DialogHeader>
                
                {user && (
                    <div className={`px-6 pb-4 ${isDark ? 'bg-gray-900/50' : 'bg-gray-50'} rounded-lg mb-4 border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex items-center gap-4 p-4">
                            <Avatar className={`h-12 w-12 border-2 ${isDark ? 'border-gray-700' : 'border-white'} shadow-sm`}>
                                <AvatarFallback className={`${isDark ? 'bg-gray-700 text-gray-200' : 'bg-blue-100 text-blue-700'} font-medium`}>
                                    {getInitials(user.firstName, user.lastName)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <h3 className={`font-medium ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>{user.firstName} {user.lastName}</h3>
                                    {user.roles && user.roles.some(role => 
                                        role.name === 'SUPERADMIN' || role.name === 'ROLE_SUPERADMIN') && (
                                        <Badge className={`${isDark ? 'bg-red-100 text-red-700 border-red-200' : 'bg-red-100 text-red-700 border-red-200'}`}>
                                            SuperAdmin
                                        </Badge>
                                    )}
                                </div>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{user.email}</p>
                            </div>
                        </div>
                        
                        {isSuperAdminAndCurrentUserIsNot && (
                            <Alert variant="destructive" className={`${isDark ? 'bg-red-50 text-red-800 border-red-200' : 'bg-red-50 text-red-800 border-red-200'} mb-4`}>
                                <Ban className="h-4 w-4" />
                                <AlertTitle className={`${isDark ? 'font-medium' : 'font-medium'}`}>Accès limité</AlertTitle>
                                <AlertDescription className={`${isDark ? 'text-sm' : 'text-sm'}`}>
                                    Vous ne pouvez pas modifier un SuperAdmin.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                )}
                
                <form onSubmit={handleSubmit} className="px-6 pb-0">
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <User className="h-3.5 w-3.5 inline mr-1.5 text-gray-500" />
                                    Prénom
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className={`w-full ${isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : ''} ${errors.firstName ? 'border-red-500' : ''}`}
                                        disabled={isProcessing || isSuperAdminAndCurrentUserIsNot}
                                        placeholder="Jean"
                                    />
                                    {errors.firstName && (
                                        <div className="text-red-500 text-xs mt-1 flex items-center">
                                            <X className="h-3 w-3 mr-1" />
                                            {errors.firstName}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <User className="h-3.5 w-3.5 inline mr-1.5 text-gray-500" />
                                    Nom
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className={`w-full ${isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : ''} ${errors.lastName ? 'border-red-500' : ''}`}
                                        disabled={isProcessing || isSuperAdminAndCurrentUserIsNot}
                                        placeholder="Dupont"
                                    />
                                    {errors.lastName && (
                                        <div className="text-red-500 text-xs mt-1 flex items-center">
                                            <X className="h-3 w-3 mr-1" />
                                            {errors.lastName}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="space-y-2">
                            <Label htmlFor="email" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                <Mail className="h-3.5 w-3.5 inline mr-1.5 text-gray-500" />
                                Email
                            </Label>
                            <div className="relative">
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full ${isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : ''} ${errors.email ? 'border-red-500' : ''}`}
                                    disabled={isProcessing || isSuperAdminAndCurrentUserIsNot}
                                    placeholder="jean.dupont@example.com"
                                />
                                {errors.email && (
                                    <div className="text-red-500 text-xs mt-1 flex items-center">
                                        <X className="h-3 w-3 mr-1" />
                                        {errors.email}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <Phone className="h-3.5 w-3.5 inline mr-1.5 text-gray-500" />
                                    Téléphone
                                </Label>
                                <div className="relative">
                                    <PhoneInput
                                        id="phoneNumber"
                                        name="phoneNumber"
                                        value={formData.phoneNumber}
                                        onChange={handlePhoneChange}
                                        error={errors.phoneNumber}
                                        disabled={isProcessing || isSuperAdminAndCurrentUserIsNot}
                                        placeholder="06 12 34 56 78"
                                    />
                                    {errors.phoneNumber && (
                                        <div className="mt-1 text-sm text-red-500">
                                            <X className="h-3 w-3 mr-1" />
                                            {errors.phoneNumber}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="birthDate" className={`text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    <Calendar className="h-3.5 w-3.5 inline mr-1.5 text-gray-500" />
                                    Date de naissance
                                </Label>
                                <div className="relative">
                                    <Input
                                        id="birthDate"
                                        name="birthDate"
                                        type="date"
                                        value={formData.birthDate}
                                        onChange={handleChange}
                                        className={`w-full ${isDark ? 'bg-gray-900 border-gray-700 text-gray-200' : ''} ${errors.birthDate ? 'border-red-500' : ''}`}
                                        disabled={isProcessing || isSuperAdminAndCurrentUserIsNot}
                                    />
                                    {errors.birthDate && (
                                        <div className="text-red-500 text-xs mt-1 flex items-center">
                                            <X className="h-3 w-3 mr-1" />
                                            {errors.birthDate}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <DialogFooter className="py-4 mt-4 border-t flex justify-between flex-row">
                        <Button 
                            type="button" 
                            variant="outline" 
                            onClick={onClose}
                            disabled={isProcessing}
                            className={`${isDark ? 'bg-gray-900 border-gray-700 hover:bg-gray-800 text-gray-200' : 'bg-white hover:bg-gray-50'}`}
                        >
                            Annuler
                        </Button>
                        <motion.div
                            whileHover={{ scale: isProcessing || isSuperAdminAndCurrentUserIsNot || !formChanged ? 1 : 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Button 
                                type="submit" 
                                disabled={isProcessing || isSuperAdminAndCurrentUserIsNot || !formChanged}
                                className={`${isDark ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
                            >
                                {isProcessing ? (
                                    <div className="flex items-center">
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enregistrement...
                                    </div>
                                ) : (
                                    <div className="flex items-center">
                                        <Check className="mr-2 h-4 w-4" />
                                        Enregistrer
                                    </div>
                                )}
                            </Button>
                        </motion.div>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default EditUserDialog; 