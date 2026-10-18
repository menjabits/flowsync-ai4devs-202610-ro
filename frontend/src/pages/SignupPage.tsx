import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router'
import { useAuth } from '@/auth/use-auth'
import { ApiError } from '@/lib/api'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Field = 'fullName' | 'email' | 'password' | 'passwordConfirmation'
type FieldErrors = Partial<Record<Field, string>>

// Mismas reglas que `signupValidator` en el backend.
const PASSWORD_MIN = 8
const PASSWORD_MAX = 32
const EMAIL_MAX = 254

function validate(values: Record<Field, string>): FieldErrors {
  const errors: FieldErrors = {}
  if (!values.email) errors.email = 'Introduce tu email.'
  else if (values.email.length > EMAIL_MAX)
    errors.email = 'El email es demasiado largo.'

  if (values.password.length < PASSWORD_MIN)
    errors.password = `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`
  else if (values.password.length > PASSWORD_MAX)
    errors.password = `La contraseña no puede tener más de ${PASSWORD_MAX} caracteres.`

  if (values.passwordConfirmation !== values.password)
    errors.passwordConfirmation = 'Las contraseñas no coinciden.'
  return errors
}

/** Traduce los errores 422 del backend a mensajes por campo. */
function messageForRule(rule: string | undefined, fallback: string) {
  switch (rule) {
    case 'database.unique':
      return 'Ya existe una cuenta con este email.'
    case 'email':
      return 'Introduce un email válido.'
    case 'minLength':
      return `La contraseña debe tener al menos ${PASSWORD_MIN} caracteres.`
    case 'maxLength':
      return 'El valor es demasiado largo.'
    case 'sameAs':
      return 'Las contraseñas no coinciden.'
    case 'required':
      return 'Este campo es obligatorio.'
    default:
      return fallback
  }
}

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [values, setValues] = useState<Record<Field, string>>({
    fullName: '',
    email: '',
    password: '',
    passwordConfirmation: '',
  })
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function update(field: Field, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setFieldErrors((current) => ({ ...current, [field]: undefined }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setFormError(null)

    const errors = validate(values)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      await signup({
        fullName: values.fullName.trim() || null,
        email: values.email.trim(),
        password: values.password,
        passwordConfirmation: values.passwordConfirmation,
      })
      navigate('/profile', { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 422) {
        const next: FieldErrors = {}
        for (const item of error.errors) {
          const field = item.field as Field | undefined
          if (field && !next[field])
            next[field] = messageForRule(item.rule, item.message)
        }
        setFieldErrors(next)
        if (Object.keys(next).length === 0)
          setFormError('Revisa los datos del formulario.')
      } else if (error instanceof ApiError) {
        setFormError(
          error.status === 0
            ? error.message
            : 'No se ha podido crear la cuenta. Inténtalo de nuevo.',
        )
      } else {
        setFormError('No se ha podido crear la cuenta. Inténtalo de nuevo.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const fields: {
    name: Field
    label: string
    type: string
    autoComplete: string
  }[] = [
    {
      name: 'fullName',
      label: 'Nombre (opcional)',
      type: 'text',
      autoComplete: 'name',
    },
    { name: 'email', label: 'Email', type: 'email', autoComplete: 'email' },
    {
      name: 'password',
      label: 'Contraseña',
      type: 'password',
      autoComplete: 'new-password',
    },
    {
      name: 'passwordConfirmation',
      label: 'Repite la contraseña',
      type: 'password',
      autoComplete: 'new-password',
    },
  ]

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Crear cuenta</CardTitle>
          <CardDescription>
            Regístrate con tu email y una contraseña.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} noValidate>
          <CardContent className="flex flex-col gap-4">
            {formError && (
              <Alert variant="destructive">
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}
            {fields.map(({ name, label, type, autoComplete }) => (
              <div key={name} className="flex flex-col gap-2">
                <Label htmlFor={name}>{label}</Label>
                <Input
                  id={name}
                  name={name}
                  type={type}
                  autoComplete={autoComplete}
                  value={values[name]}
                  onChange={(event) => update(name, event.target.value)}
                  aria-invalid={Boolean(fieldErrors[name])}
                  aria-describedby={
                    fieldErrors[name] ? `${name}-error` : undefined
                  }
                />
                {fieldErrors[name] && (
                  <p id={`${name}-error`} className="text-sm text-destructive">
                    {fieldErrors[name]}
                  </p>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter className="mt-6 flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? 'Creando cuenta…' : 'Crear cuenta'}
            </Button>
            <p className="text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{' '}
              <Link
                to="/login"
                className="font-medium text-foreground underline"
              >
                Inicia sesión
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </main>
  )
}
