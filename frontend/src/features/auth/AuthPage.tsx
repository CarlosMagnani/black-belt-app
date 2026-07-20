import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import {
  loginSchema,
  registrationSchema,
  type LoginValues,
  type RegistrationValues,
} from './auth.schemas'

type AuthMode = 'login' | 'register'

type ConfirmationState = {
  email?: string
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const isLogin = mode === 'login'

  return (
    <main className="auth-page bb-grain">
      <div className="auth-page__stripes" aria-hidden="true" />
      <section className="auth-page__content page-enter">
        <Brand />
        <div className="auth-card">
          <p className="eyebrow">{isLogin ? 'ENTRADA NO TATAME' : 'PRIMEIRO ROLÊ'}</p>
          <h1>{isLogin ? 'ENTRE NO TATAME.' : 'COMECE SUA JORNADA.'}</h1>
          <p className="auth-card__lead">
            {isLogin
              ? 'Acesse sua academia, seus treinos e sua evolução.'
              : 'Crie sua conta para entrar no sistema da sua academia.'}
          </p>
          {isLogin ? <LoginForm /> : <RegistrationForm />}
          <p className="auth-switch">
            {isLogin ? 'Ainda não tem conta?' : 'Já faz parte do tatame?'}{' '}
            <Link to={isLogin ? '/sign-up' : '/login'}>
              {isLogin ? 'Criar conta' : 'Entrar'}
            </Link>
          </p>
        </div>
        <p className="auth-page__footer">OSS · RESPEITE A ARTE</p>
      </section>
    </main>
  )
}

function LoginForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>()

  async function onSubmit(values: LoginValues) {
    const parsed = loginSchema.safeParse(values)

    if (!parsed.success) {
      applyValidationErrors(parsed.error.issues, setError)
      return
    }

    const { error } = await supabase.auth.signInWithPassword(parsed.data)

    if (error) {
      setError('root', { message: 'E-mail ou senha inválidos. Tente novamente.' })
      return
    }

    navigate('/welcome', { replace: true })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="E-mail" error={errors.email?.message}>
        <input {...register('email')} type="email" autoComplete="email" placeholder="voce@academia.com" />
      </FormField>
      <FormField label="Senha" error={errors.password?.message}>
        <input
          {...register('password')}
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
        />
      </FormField>
      <FormError message={errors.root?.message} />
      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'ENTRANDO...' : 'ENTRAR NO TATAME →'}
      </button>
    </form>
  )
}

function RegistrationForm() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationValues>()

  async function onSubmit(values: RegistrationValues) {
    const parsed = registrationSchema.safeParse(values)

    if (!parsed.success) {
      applyValidationErrors(parsed.error.issues, setError)
      return
    }

    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${window.location.origin}/welcome` },
    })

    if (error) {
      setError('root', { message: 'Não foi possível criar sua conta. Tente novamente.' })
      return
    }

    navigate('/confirm-email', { state: { email: parsed.data.email } satisfies ConfirmationState })
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormField label="E-mail" error={errors.email?.message}>
        <input {...register('email')} type="email" autoComplete="email" placeholder="voce@academia.com" />
      </FormField>
      <FormField label="Senha" hint="Mínimo de 8 caracteres" error={errors.password?.message}>
        <input
          {...register('password')}
          type="password"
          autoComplete="new-password"
          placeholder="Crie uma senha forte"
        />
      </FormField>
      <FormField label="Confirmar senha" error={errors.passwordConfirmation?.message}>
        <input
          {...register('passwordConfirmation')}
          type="password"
          autoComplete="new-password"
          placeholder="Repita sua senha"
        />
      </FormField>
      <FormError message={errors.root?.message} />
      <button className="button button--primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'CRIANDO...' : 'CRIAR MINHA CONTA →'}
      </button>
    </form>
  )
}

export function ConfirmationPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [isResending, setIsResending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const email = (location.state as ConfirmationState | null)?.email

  async function resendConfirmation() {
    if (!email) {
      setMessage('Volte para criar sua conta e informe seu e-mail novamente.')
      return
    }

    setIsResending(true)
    setMessage(null)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: `${window.location.origin}/welcome` },
    })
    setIsResending(false)
    setMessage(error ? 'Não foi possível reenviar agora. Tente novamente em instantes.' : 'Novo e-mail enviado.')
  }

  return (
    <main className="auth-page bb-grain">
      <div className="auth-page__stripes" aria-hidden="true" />
      <section className="auth-page__content page-enter">
        <Brand />
        <div className="auth-card confirmation-card">
          <p className="eyebrow">CONTA QUASE PRONTA</p>
          <div className="confirmation-card__mark" aria-hidden="true">✓</div>
          <h1>CONFIRME SEU E-MAIL.</h1>
          <p className="auth-card__lead">
            Enviamos um link para {email ? <strong>{email}</strong> : 'seu e-mail'}. Confirme sua conta para entrar no tatame.
          </p>
          <FormError message={message} />
          <button className="button button--ghost" type="button" onClick={resendConfirmation} disabled={isResending}>
            {isResending ? 'REENVIANDO...' : 'REENVIAR E-MAIL'}
          </button>
          <button className="text-button" type="button" onClick={() => navigate('/login')}>
            Já confirmou? Entrar
          </button>
        </div>
        <p className="auth-page__footer">OSS · RESPEITE A ARTE</p>
      </section>
    </main>
  )
}

function FormField({
  children,
  error,
  hint,
  label,
}: {
  children: React.ReactNode
  error?: string
  hint?: string
  label: string
}) {
  return (
    <label className="form-field">
      <span>{label}</span>
      {children}
      {error ? <small className="form-field__error">{error}</small> : hint ? <small>{hint}</small> : null}
    </label>
  )
}

function FormError({ message }: { message?: string | null }) {
  return message ? <p className="form-error" role="alert">{message}</p> : null
}

function Brand() {
  return (
    <div className="brand-lockup" aria-label="Black Belt">
      <span>BLACK</span>
      <span>BELT</span>
      <small>BJJ ACADEMY · OSS</small>
    </div>
  )
}

function applyValidationErrors(
  issues: { message: string; path: PropertyKey[] }[],
  setError: ReturnType<typeof useForm<LoginValues>>['setError'],
) {
  for (const issue of issues) {
    const field = issue.path[0]

    if (typeof field === 'string') {
      setError(field as keyof LoginValues, { message: issue.message })
    }
  }
}
