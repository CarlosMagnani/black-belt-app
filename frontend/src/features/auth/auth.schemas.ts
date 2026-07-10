import { z } from 'zod'

export const loginSchema = z.object({
  email: z.email('Digite um e-mail válido.'),
  password: z.string().min(1, 'Digite sua senha.'),
})

export const registrationSchema = z
  .object({
    email: z.email('Digite um e-mail válido.'),
    password: z.string().min(8, 'Sua senha precisa ter ao menos 8 caracteres.'),
    passwordConfirmation: z.string(),
  })
  .refine((values) => values.password === values.passwordConfirmation, {
    message: 'As senhas não conferem.',
    path: ['passwordConfirmation'],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegistrationValues = z.infer<typeof registrationSchema>
