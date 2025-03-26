import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { CountrySelector } from "@/components/ui/country-selector";
import { mapCountryValueToNationalityName } from "@/lib/services/countryMapping";
import { toast } from 'sonner';
import apiService from '@/lib/services/apiService';

const CreateUserDialog = ({ open, onOpenChange, onUserCreated }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [roles, setRoles] = useState([]);
    const [formData, setFormData] = useState({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        birth_date: '',
        nationality: 'france',
        role_id: '',
        address_name: '',
        address_complement: '',
        city: '',
        postal_code: '',
    });
    const [errors, setErrors] = useState({});
    const [emailStatus, setEmailStatus] = useState({ message: '', type: '' });

    // Charger les rôles au chargement du composant
    useEffect(() => {
        const fetchRoles = async () => {
            try {
                const response = await apiService.get("/api/admin/roles");
                if (response.success) {
                    setRoles(response.roles);
                } else {
                    toast.error("Impossible de charger les rôles");
                }
            } catch (error) {
                console.error("Erreur lors du chargement des rôles:", error);
                toast.error("Erreur lors du chargement des rôles");
            }
        };

        if (open) {
            fetchRoles();
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Effacer l'erreur lors de la saisie
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleNationalityChange = (value) => {
        setFormData(prev => ({ ...prev, nationality: value }));
        if (errors.nationality) {
            setErrors(prev => ({ ...prev, nationality: undefined }));
        }
    };

    const handleRoleChange = (value) => {
        setFormData(prev => ({ ...prev, role_id: value }));
        if (errors.role_id) {
            setErrors(prev => ({ ...prev, role_id: undefined }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.first_name.trim()) newErrors.first_name = "Le prénom est requis";
        if (!formData.last_name.trim()) newErrors.last_name = "Le nom est requis";

        if (!formData.email.trim()) {
            newErrors.email = "L'email est requis";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Format d'email invalide";
        }

        if (!formData.phone_number.trim()) {
            newErrors.phone_number = "Le numéro de téléphone est requis";
        }

        if (!formData.birth_date) {
            newErrors.birth_date = "La date de naissance est requise";
        }

        if (!formData.nationality) {
            newErrors.nationality = "La nationalité est requise";
        }

        if (!formData.role_id) {
            newErrors.role_id = "Le rôle est requis";
        }

        // Validation des champs d'adresse
        if (!formData.address_name.trim()) {
            newErrors.address_name = "L'adresse est requise";
        }
        if (!formData.city.trim()) {
            newErrors.city = "La ville est requise";
        }
        if (!formData.postal_code.trim()) {
            newErrors.postal_code = "Le code postal est requis";
        } else if (!/^\d{5}$/.test(formData.postal_code)) {
            newErrors.postal_code = "Le code postal doit contenir 5 chiffres";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsSubmitting(true);

        try {
            // Vérifier si l'email existe déjà
            const checkEmailResponse = await apiService.get(`/api/admin/check-email/${formData.email}`);
            if (!checkEmailResponse.success) {
                setErrors(prev => ({
                    ...prev,
                    email: "Un utilisateur avec cet email existe déjà"
                }));
                setIsSubmitting(false);
                return;
            }

            // Convertir la valeur du pays en nom de nationalité
            const nationalityName = mapCountryValueToNationalityName(formData.nationality);
            
            const userData = {
                ...formData,
                nationality: nationalityName,
                role_id: parseInt(formData.role_id)
            };

            console.log("Données utilisateur à envoyer:", userData);
            
            const response = await apiService.post(
                '/api/admin/create-user',
                userData
            );

            if (response.success) {
                toast.success("Utilisateur créé avec succès!");

                onOpenChange(false);
                if (onUserCreated) onUserCreated();

                setFormData({
                    first_name: '',
                    last_name: '',
                    email: '',
                    phone_number: '',
                    birth_date: '',
                    nationality: 'france',
                    role_id: '',
                    address_name: '',
                    address_complement: '',
                    city: '',
                    postal_code: '',
                });

                // Afficher le mot de passe temporaire (à supprimer en production)
                if (response.user && response.user.temp_password) {
                    toast.info(`Mot de passe temporaire: ${response.user.temp_password}`, {
                        duration: 10000,
                    });
                }
            } else {
                toast.error(response.message || "Erreur lors de la création de l'utilisateur");
            }
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Une erreur est survenue lors de la création de l'utilisateur");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                    <DialogDescription>
                        Remplissez les informations pour créer un nouvel utilisateur.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="py-3 space-y-4">
                    <div className="space-y-4">
                        <h3 className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300">
                            Informations personnelles
                        </h3>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="first_name">Prénom <span className="text-red-500">*</span></Label>
                                <Input
                                    id="first_name"
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    placeholder="Prénom"
                                    className={errors.first_name ? "border-red-500" : ""}
                                />
                                {errors.first_name && (
                                    <p className="text-xs text-red-500">{errors.first_name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="last_name">Nom <span className="text-red-500">*</span></Label>
                                <Input
                                    id="last_name"
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    placeholder="Nom"
                                    className={errors.last_name ? "border-red-500" : ""}
                                />
                                {errors.last_name && (
                                    <p className="text-xs text-red-500">{errors.last_name}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="nationality">Nationalité <span className="text-red-500">*</span></Label>
                            <CountrySelector
                                value={formData.nationality}
                                onChange={handleNationalityChange}
                                error={errors.nationality}
                            />
                            {errors.nationality && (
                                <p className="text-xs text-red-500">{errors.nationality}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="email@exemple.com"
                                className={errors.email ? "border-red-500" : ""}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500">{errors.email}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="phone_number">Téléphone <span className="text-red-500">*</span></Label>
                            <Input
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                placeholder="0612345678"
                                className={errors.phone_number ? "border-red-500" : ""}
                            />
                            {errors.phone_number && (
                                <p className="text-xs text-red-500">{errors.phone_number}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="birth_date">Date de naissance <span className="text-red-500">*</span></Label>
                            <Input
                                id="birth_date"
                                name="birth_date"
                                type="date"
                                value={formData.birth_date}
                                onChange={handleChange}
                                className={errors.birth_date ? "border-red-500" : ""}
                            />
                            {errors.birth_date && (
                                <p className="text-xs text-red-500">{errors.birth_date}</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300">
                            Rôle
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="role_id">Rôle <span className="text-red-500">*</span></Label>
                            <Select
                                value={formData.role_id}
                                onValueChange={handleRoleChange}
                            >
                                <SelectTrigger id="role_id" className={errors.role_id ? "border-red-500" : ""}>
                                    <SelectValue placeholder="Sélectionner un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    {roles.map((role) => (
                                        <SelectItem key={role.id} value={role.id.toString()}>
                                            {role.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {errors.role_id && (
                                <p className="text-xs text-red-500">{errors.role_id}</p>
                            )}
                        </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <h3 className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300">
                            Adresse
                        </h3>

                        <div className="space-y-2">
                            <Label htmlFor="address_name">Adresse <span className="text-red-500">*</span></Label>
                            <Input
                                id="address_name"
                                name="address_name"
                                value={formData.address_name}
                                onChange={handleChange}
                                placeholder="123 Rue de la Paix"
                                className={errors.address_name ? "border-red-500" : ""}
                            />
                            {errors.address_name && (
                                <p className="text-xs text-red-500">{errors.address_name}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address_complement">Complément d'adresse</Label>
                            <Input
                                id="address_complement"
                                name="address_complement"
                                value={formData.address_complement}
                                onChange={handleChange}
                                placeholder="Appartement 4B"
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="city">Ville <span className="text-red-500">*</span></Label>
                                <Input
                                    id="city"
                                    name="city"
                                    value={formData.city}
                                    onChange={handleChange}
                                    placeholder="Paris"
                                    className={errors.city ? "border-red-500" : ""}
                                />
                                {errors.city && (
                                    <p className="text-xs text-red-500">{errors.city}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="postal_code">Code postal <span className="text-red-500">*</span></Label>
                                <Input
                                    id="postal_code"
                                    name="postal_code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    placeholder="75001"
                                    className={errors.postal_code ? "border-red-500" : ""}
                                />
                                {errors.postal_code && (
                                    <p className="text-xs text-red-500">{errors.postal_code}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="mt-6">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                            Annuler
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Création en cours...' : 'Créer'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateUserDialog;