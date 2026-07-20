import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useClasses } from '../../hooks/useClasses'
import { useMyCheckInsToday } from '../../hooks/useMyCheckInsToday'
import { useRequestCheckIn } from '../../hooks/useRequestCheckIn'
import { IconButton } from '../../components/IconButton'
import { SlideToConfirm } from '../../components/SlideToConfirm'
import { ErrorState } from '../../components/ErrorState'
import { ChevronLeftIcon, ClockIcon, HourglassIcon, CheckIcon, XIcon } from '../../components/Icons'
import { formatClassDuration, formatClassLevel, formatScheduleTime } from '../../utils/scheduleFormat'
import type { CheckInRecord, CheckInStatus } from '../../features/checkin/checkin.types'

function professorInitials(fullName: string): string {
  return fullName
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function checkInByClassId(checkIns: CheckInRecord[], classId: string): CheckInRecord | undefined {
  return checkIns.find((checkIn) => checkIn.classScheduleId === classId)
}

function CheckInBanner({ status }: { status: CheckInStatus }) {
  if (status === 'pending') {
    return (
      <div className="bg-red text-text p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 bg-black flex items-center justify-center shrink-0">
          <HourglassIcon className="w-5 h-5 text-text" strokeWidth={2.2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-[16px] uppercase leading-tight">AGUARDANDO APROVAÇÃO</p>
          <p className="text-[12px] opacity-90 mt-0.5">O mestre vai revisar sua chamada.</p>
        </div>
      </div>
    )
  }

  if (status === 'approved') {
    return (
      <div className="bg-red text-text p-4 flex items-center gap-3.5">
        <div className="w-11 h-11 bg-black flex items-center justify-center shrink-0">
          <CheckIcon className="w-5 h-5 text-text" strokeWidth={2.4} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display text-[16px] uppercase leading-tight">PRESENTE</p>
          <p className="text-[12px] opacity-90 mt-0.5">BOA TREINO</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-red text-text p-4 flex items-center gap-3.5">
      <div className="w-11 h-11 bg-black flex items-center justify-center shrink-0">
        <XIcon className="w-5 h-5 text-text" strokeWidth={2.4} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display text-[16px] uppercase leading-tight">RECUSADO</p>
        <p className="text-[12px] opacity-90 mt-0.5">Esta aula não pôde ser confirmada.</p>
      </div>
    </div>
  )
}

export function ClassDetailPage() {
  const { classId } = useParams<{ classId: string }>()
  const navigate = useNavigate()
  const { classes, isLoading: isLoadingClasses, isError: isClassesError, refetch: refetchClasses } = useClasses()
  const { checkIns, isLoading: isLoadingCheckIns, isError: isCheckInsError, refetch: refetchCheckIns } = useMyCheckInsToday()
  const { requestCheckIn, isPending } = useRequestCheckIn()

  const cls = useMemo(() => classes.find((c) => c.id === classId), [classes, classId])
  const checkIn = useMemo(
    () => (classId ? checkInByClassId(checkIns, classId) : undefined),
    [checkIns, classId]
  )
  const status = checkIn?.status ?? 'idle'

  const isLoading = isLoadingClasses || isLoadingCheckIns
  const isError = isClassesError || isCheckInsError

  if (isLoading) {
    return (
      <main className="min-h-[100dvh] bg-bg bb-grain page-enter">
        <div className="h-[320px] bg-surface-2 animate-pulse" />
        <div className="px-6 py-5">
          <div className="grid grid-cols-3 border border-line bg-surface-2 animate-pulse h-20" />
        </div>
      </main>
    )
  }

  if (isError || !cls) {
    return (
      <main className="min-h-[100dvh] bg-bg bb-grain page-enter px-6 py-8">
        <ErrorState
          message={!cls ? 'Aula não encontrada.' : 'Não foi possível carregar a aula.'}
          onRetry={() => {
            refetchClasses()
            refetchCheckIns()
          }}
        />
      </main>
    )
  }

  const professorName = cls.instructor.nickname ?? cls.instructor.fullName

  return (
    <main className="min-h-[100dvh] bg-bg bb-grain page-enter flex flex-col">
      {/* header */}
      <div
        className="relative shrink-0 h-[320px] overflow-hidden"
        style={{ background: 'linear-gradient(180deg, #1a0606 0%, #0a0000 100%)' }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{
            background:
              'repeating-linear-gradient(-12deg, transparent 0 23px, #fff 24px 25px, transparent 26px 48px)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(circle at 70% 60%, rgba(255,59,59,0.28), transparent 55%)',
          }}
        />

        <div className="absolute top-[60px] left-6 right-6 flex items-center justify-between">
          <IconButton
            onClick={() => navigate('/student')}
            className="bg-black/60 border-line-2 backdrop-blur-md"
            aria-label="Voltar"
          >
            <ChevronLeftIcon className="w-[18px] h-[18px]" strokeWidth={1.8} />
          </IconButton>
          <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-red">● HOJE</span>
        </div>

        <div className="absolute left-6 right-6 bottom-[22px]">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-text-2 mb-2">
            {formatClassLevel(cls.level)} · {formatClassDuration(cls.durationMinutes)}
          </div>
          <h1 className="font-display text-[44px] uppercase leading-[0.9] tracking-[-0.01em] mb-3">
            {cls.title}
          </h1>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-red flex items-center justify-center font-display text-[11px] text-text">
              {professorInitials(cls.instructor.fullName)}
            </div>
            <span className="text-[14px] font-medium">{professorName}</span>
          </div>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 px-6 py-5">
        <div className="grid grid-cols-3 border border-line">
          <div className="flex flex-col items-center gap-1.5 py-3.5">
            <ClockIcon className="w-[14px] h-[14px] text-red" />
            <span className="font-display text-[18px] leading-none">{formatScheduleTime(cls.startTime)}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-2">START</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-3.5 border-l border-line">
            <HourglassIcon className="w-[14px] h-[14px] text-red" />
            <span className="font-display text-[18px] leading-none">{formatClassDuration(cls.durationMinutes)}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-2">DURAÇÃO</span>
          </div>
          <div className="flex flex-col items-center gap-1.5 py-3.5 border-l border-line">
            <div className="w-[14px] h-[14px] rounded-full bg-red" />
            <span className="font-display text-[18px] leading-none">{formatClassLevel(cls.level)}</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-muted-2">NÍVEL</span>
          </div>
        </div>
      </div>

      {/* check-in CTA */}
      <div className="px-6 py-4 border-t border-line">
        {status === 'idle' ? (
          <SlideToConfirm
            label="ARRASTE PARA FAZER CHECK-IN"
            confirmLabel="FAZER CHECK-IN"
            onConfirm={() => requestCheckIn({ classScheduleId: cls.id })}
            isLoading={isPending}
          />
        ) : (
          <CheckInBanner status={status} />
        )}
      </div>
    </main>
  )
}
