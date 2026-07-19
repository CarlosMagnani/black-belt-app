import { useMemo } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { useClasses } from '../../hooks/useClasses'
import { useMyCheckInsToday } from '../../hooks/useMyCheckInsToday'
import { useMembershipGuard } from '../../hooks/useMembershipGuard'
import { SessionLoading } from '../../components/SessionLoading'
import { LoadingSkeleton } from '../../components/LoadingSkeleton'
import { ErrorState } from '../../components/ErrorState'
import { EmptyState } from '../../components/EmptyState'
import { StudentClassListItem } from './StudentClassListItem'
import { isClassToday, nowInSaoPaulo, formatTodayHeader } from '../../utils/scheduleFormat'
import type { CheckInRecord } from '../../features/checkin/checkin.types'

function firstName(fullName: string | null | undefined): string {
  if (!fullName) return ''
  return fullName.split(' ')[0].toUpperCase()
}

function checkInByClassId(checkIns: CheckInRecord[], classId: string): CheckInRecord | undefined {
  return checkIns.find((checkIn) => checkIn.classScheduleId === classId)
}

export function StudentHomePage() {
  const { user } = useAuth()
  const { isLoading: isMembershipLoading } = useMembershipGuard()
  const today = useMemo(() => nowInSaoPaulo(), [])

  const {
    classes,
    isLoading: isLoadingClasses,
    isError: isClassesError,
    error: classesError,
    refetch: refetchClasses,
  } = useClasses()

  const {
    checkIns,
    isLoading: isLoadingCheckIns,
    isError: isCheckInsError,
    error: checkInsError,
    refetch: refetchCheckIns,
  } = useMyCheckInsToday()

  const todaysClasses = useMemo(() => {
    return classes
      .filter((cls) => isClassToday(cls, today))
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  }, [classes, today])

  const isLoading = isLoadingClasses || isLoadingCheckIns
  const isError = isClassesError || isCheckInsError
  const errorMessage =
    classesError?.message ?? checkInsError?.message ?? 'Não foi possível carregar o tatame.'

  const handleRetry = () => {
    refetchClasses()
    refetchCheckIns()
  }

  if (isMembershipLoading) {
    return <SessionLoading />
  }

  return (
    <main className="student-home bb-grain">
      <section className="page-enter w-full max-w-[480px] mx-auto">
        <p className="eyebrow">{formatTodayHeader(today)}</p>
        <h1>BOM DIA, {firstName(user?.fullName)}.</h1>

        <div className="mt-8">
          <p className="eyebrow mb-3">HOJE NO TATAME</p>

          {isLoading && <LoadingSkeleton rows={3} />}

          {!isLoading && isError && (
            <ErrorState message={errorMessage} onRetry={handleRetry} />
          )}

          {!isLoading && !isError && todaysClasses.length === 0 && (
            <EmptyState message="Nenhuma aula hoje. Aproveite o descanso · OSS" />
          )}

          {!isLoading && !isError && todaysClasses.length > 0 && (
            <ul className="space-y-3 list-none p-0 m-0">
              {todaysClasses.map((cls) => (
                <li key={cls.id}>
                  <StudentClassListItem cls={cls} checkIn={checkInByClassId(checkIns, cls.id)} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  )
}
