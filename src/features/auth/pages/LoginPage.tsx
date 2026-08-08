import logoFullBox from "@/assets/logo-full-box.png"
import { LoginForm } from "@/features/auth/components/LoginForm"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card"

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <h1>
            <img
              src={logoFullBox}
              alt="Full Box"
              className="h-20 w-auto"
              loading="eager"
            />
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema de gestión de fábrica
          </p>
        </div>

        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-lg">Iniciar sesión</CardTitle>
            <CardDescription>
              Ingresá con las credenciales que te asignó el administrador.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          El acceso al sistema es solo por invitación del administrador.
        </p>
      </div>
    </main>
  )
}
