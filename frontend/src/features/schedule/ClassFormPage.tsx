import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { DaySelector } from '../../components/DaySelector'
import { ErrorState } from '../../components/ErrorState'
import { GhostButton } from '../../components/GhostButton'
import { LevelPill } from '../../components/LevelPill'
import { LoadingSkeleton } from '../../components/LoadingSkeleton'
import { PrimaryButton } from '../../components/PrimaryButton'
import { ProfessorSelect } from '../../components/ProfessorSelect'
import { TimePicker } from '../../components/TimePicker'
import { useAuth } from '../../hooks/useAuth'
import { useClasses } from '../../hooks/useClasses'
import { useCreateClass } from '../../hooks/useCreateClass'
import { useRoster } from '../../hooks/useRoster'
import { useUpdateClass } from '../../hooks/useUpdateClass'
import type { ClassLevel, CreateClassInput, MemberSummary, ScheduledClass } from './schedule.types'

const classFormSchema = z.object({
  title: z.string().trim().min(1, 'Título obrigatório').max(100, 'Máximo 100 caracteres'),
  dayOfWeek: z.number().int().min(0, 'Dia inválido').max(6, 'Dia inválido'),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Horário inválido (HH:mm)'),
  durationMinutes: z.number().int().min(15, 'Mínimo 15 min').max(240, 'Máximo 240 min'),
  location: z
    .string()
    .trim()
    .max(100, 'Máximo 100 caracteres')
    .optional()
    .or(z.literal('')),
  level: z.enum(['todas', 'iniciante', 'intermediario', 'avancado']).optional().nullable(),
  instructorId: z.string().uuid('Selecione um professor'),
})

type FormValues = z.infer<typeof classFormSchema>

const emptyFormValues: FormValues = {
  title: '',
  dayOfWeek: 1,
  startTime: '07:00',
  durationMinutes: 60,
  location: undefined,
  level: null,
  instructorId: '',
}

function classToFormValues(cls: ScheduledClass, members: MemberSummary[]): FormValues {
  return {
    title: cls.title,
    dayOfWeek: cls.dayOfWeek,
    startTime: cls.startTime,
    durationMinutes: cls.durationMinutes,
    location: cls.location ?? undefined,
    level: cls.level,
    instructorId: resolveInstructorUserId(cls.instructor.id, members),
  }
}

function resolveInstructorUserId(instructorId: string, members: MemberSummary[]): string {
  // instructorId from the backend is User.id (ClassSchedule.instructorId FK), not AcademyMember.id
  const member = members.find((member) => member.userId === instructorId)
  return member?.userId ?? instructorId
}

export function ClassFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const navigate = useNavigate()
  const { classId } = useParams<{ classId: string }>()
  const { onboardingRole } = useAuth()
  const isOwner = onboardingRole === 'owner'
  const createClass = useCreateClass()
  const updateClass = useUpdateClass()
  const { members, isLoading: isLoadingRoster, refetch: refetchRoster } = useRoster()
  const { classes, isLoading: isLoadingClasses } = useClasses(true)

  const classToEdit = mode === 'edit' && classId ? classes.find((cls) => cls.id === classId) : undefined

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(classFormSchema),
    defaultValues: mode === 'edit' && classToEdit ? classToFormValues(classToEdit, members) : emptyFormValues,
  })

  useEffect(() => {
    if (mode === 'edit' && classToEdit) {
      reset(classToFormValues(classToEdit, members))
    }
  }, [mode, classToEdit, members, reset])

  function toClassInput(data: FormValues): CreateClassInput {
    return {
      title: data.title,
      dayOfWeek: data.dayOfWeek as CreateClassInput['dayOfWeek'],
      startTime: data.startTime,
      durationMinutes: data.durationMinutes,
      location: data.location || undefined,
      level: data.level,
      instructorId: data.instructorId,
    }
  }

  function onSubmit(data: FormValues) {
    const input = toClassInput(data)

    if (mode === 'create') {
      createClass.mutate(input)
      return
    }

    if (!classId || !classToEdit) return
    updateClass.mutate({ classId, body: input })
  }

  function handleCancel() {
    navigate('/owner/schedule')
  }

  const isLoading = isLoadingRoster || (mode === 'edit' && isLoadingClasses)
  const isPending = createClass.isPending || updateClass.isPending

  if (!isOwner) {
    return (
      <section className="page-enter pt-4">
        <ErrorState
          message="Apenas o dono da academia pode criar ou editar aulas."
          onRetry={handleCancel}
        />
      </section>
    )
  }

  if (isLoading) {
    return (
      <section className="page-enter space-y-6">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">AGENDA</p>
          <h2 className="font-display text-[22px] uppercase tracking-[-0.01em] leading-[0.95]">
            {mode === 'edit' ? 'EDITAR AULA' : 'CRIAR AULA'}
          </h2>
        </div>
        <LoadingSkeleton rows={6} />
      </section>
    )
  }

  if (mode === 'edit' && !classToEdit) {
    return (
      <section className="page-enter pt-4">
        <ErrorState
          message="Aula não encontrada."
          onRetry={() => {
            void refetchRoster()
          }}
        />
      </section>
    )
  }

  return (
    <section className="page-enter space-y-6">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-2">AGENDA</p>
        <h2 className="font-display text-[22px] uppercase tracking-[-0.01em] leading-[0.95]">
          {mode === 'edit' ? 'EDITAR AULA' : 'CRIAR AULA'}
        </h2>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="form-field">
          <span>Título da aula</span>
          <input
            type="text"
            placeholder="Ex: Fundamentos"
            {...register('title')}
            className="h-[56px] w-full bg-surface border border-line px-4 text-[17px] text-text outline-none focus:border-red"
          />
          {errors.title && <p className="text-[12px] text-red">{errors.title.message}</p>}
        </div>

        <div className="form-field">
          <span>Dia da semana</span>
          <Controller
            name="dayOfWeek"
            control={control}
            render={({ field }) => (
              <DaySelector value={field.value} onChange={field.onChange} error={errors.dayOfWeek?.message} />
            )}
          />
        </div>

        <div className="form-field">
          <span>Horário</span>
          <Controller
            name="startTime"
            control={control}
            render={({ field }) => (
              <TimePicker value={field.value} onChange={field.onChange} error={errors.startTime?.message} />
            )}
          />
        </div>

        <div className="form-field">
          <span>Duração (minutos)</span>
          <input
            type="number"
            min={15}
            max={240}
            step={15}
            {...register('durationMinutes', { valueAsNumber: true })}
            className="h-[56px] w-full bg-surface border border-line px-4 text-[17px] text-text outline-none focus:border-red"
          />
          <small>Entre 15 e 240 minutos.</small>
          {errors.durationMinutes && <p className="text-[12px] text-red">{errors.durationMinutes.message}</p>}
        </div>

        <div className="form-field">
          <span>Local (opcional)</span>
          <input
            type="text"
            placeholder="Ex: Mat 1"
            {...register('location')}
            className="h-[56px] w-full bg-surface border border-line px-4 text-[17px] text-text outline-none focus:border-red"
          />
          {errors.location && <p className="text-[12px] text-red">{errors.location.message}</p>}
        </div>

        <div className="form-field">
          <span>Nível (opcional)</span>
          <Controller
            name="level"
            control={control}
            render={({ field }) => (
              <LevelPill
                value={field.value as ClassLevel | null}
                onChange={field.onChange}
                allowEmpty
                error={errors.level?.message}
              />
            )}
          />
        </div>

        <div className="form-field">
          <span>Professor</span>
          <Controller
            name="instructorId"
            control={control}
            render={({ field }) => (
              <ProfessorSelect
                value={field.value}
                onChange={field.onChange}
                academyMembers={members}
                error={errors.instructorId?.message}
              />
            )}
          />
        </div>

        <div className="pt-4 space-y-3">
          <PrimaryButton type="submit" fullWidth disabled={isPending}>
            {isPending ? 'SALVANDO...' : mode === 'edit' ? 'SALVAR ALTERAÇÕES' : 'CRIAR AULA'}
          </PrimaryButton>
          <GhostButton type="button" fullWidth onClick={handleCancel} disabled={isPending}>
            CANCELAR
          </GhostButton>
        </div>
      </form>
    </section>
  )
}
