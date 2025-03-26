import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { CountrySelector, countries } from "@/components/ui/country-selector"
import { toast } from "sonner"
import { authService } from "@/lib/services/authService"
import { mapCountryValueToNationalityName } from "@/lib/services/countryMapping"

const formSchema = z.object({
  firstname: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  role: z.string().min(1, "Le rôle est requis"),
  nationality: z.string().min(1, "La nationalité est requise"),
})

export function CreateUserDialog({ onUserCreated }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstname: "",
      lastname: "",
      email: "",
      password: "",
      role: "",
      nationality: "france", // Valeur par défaut: France
    },
  })

  // Décommenter si vous avez besoin de charger les nationalités depuis l'API
  // Si vous préférez utiliser la liste statique du sélecteur de pays, laissez ceci commenté
  /*
  useEffect(() => {
    const fetchNationalities = async () => {
      try {
        const response = await apiService.get('/nationalities');
        setNationalities(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des nationalités:", error);
      }
    };
    fetchNationalities();
  }, []);
  */

  const onSubmit = async (values) => {
    try {
      setLoading(true)
      // Convertir la valeur du pays en nom de nationalité avant l'envoi
      const nationalityName = mapCountryValueToNationalityName(values.nationality)
      const userData = {
        ...values,
        nationality: nationalityName
      }
      
      console.log("Données envoyées:", userData)
      const response = await authService.createUser(userData)
      toast.success("Utilisateur créé avec succès")
      form.reset({
        firstname: "",
        lastname: "",
        email: "",
        password: "",
        role: "",
        nationality: "france",
      })
      setOpen(false)
      if (onUserCreated) onUserCreated(response)
    } catch (error) {
      console.error("Erreur lors de la création:", error)
      toast.error(error.message || "Erreur lors de la création de l'utilisateur")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Ajouter un utilisateur</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créer un utilisateur</DialogTitle>
          <DialogDescription>
            Remplissez les informations pour créer un nouvel utilisateur.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="firstname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prénom</FormLabel>
                  <FormControl>
                    <Input placeholder="Prénom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom</FormLabel>
                  <FormControl>
                    <Input placeholder="Nom" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mot de passe</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Mot de passe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rôle</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un rôle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ROLE_STUDENT">Étudiant</SelectItem>
                      <SelectItem value="ROLE_TEACHER">Professeur</SelectItem>
                      <SelectItem value="ROLE_HR">RH</SelectItem>
                      <SelectItem value="ROLE_ADMIN">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="nationality"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nationalité</FormLabel>
                  <FormControl>
                    <CountrySelector
                      value={field.value}
                      onChange={field.onChange}
                      error={form.formState.errors.nationality?.message}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={loading}>
                {loading ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 