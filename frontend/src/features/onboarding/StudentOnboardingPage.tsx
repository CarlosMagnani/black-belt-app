import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../lib/api'
import type { StudentBeltId, StudentMembership } from './student.types'

const BELTS = [
  { id: 'white', label: 'BRANCA', color: '#E9E9E9' },
  { id: 'blue', label: 'AZUL', color: '#3557C8' },
  { id: 'purple', label: 'ROXA', color: '#6F3A9B' },
  { id: 'brown', label: 'MARROM', color: '#70402B' },
  { id: 'black', label: 'PRETA', color: '#171717' },
] as const

type AcademyIdentity = StudentMembership['academy']
type ImagePreview = { file: File; name: string; url: string }

export function StudentOnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [inviteCode, setInviteCode] = useState('')
  const [verifiedAcademy, setVerifiedAcademy] = useState<AcademyIdentity | null>(null)
  const [nickname, setNickname] = useState('')
  const [photo, setPhoto] = useState<ImagePreview | null>(null)
  const [belt, setBelt] = useState<StudentBeltId>('white')
  const [degree, setDegree] = useState(0)
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState<string | null>(null)
  const [isCheckingMembership, setIsCheckingMembership] = useState(true)
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => () => releasePreview(photo), [photo])

  useEffect(() => {
    let isActive = true

    apiClient<StudentMembership>('/memberships/me')
      .then((result) => {
        if (!isActive) return
        if (result.data) {
          navigate('/student', { replace: true, state: { membership: result.data } })
          return
        }
        if (result.error && result.error.code !== 'MEMBERSHIP_NOT_FOUND') {
          setFieldError(getJoinErrorMessage(result.error.code))
        }
      })
      .catch(() => {
        if (isActive) setFieldError('Não foi possível verificar seu cadastro. Tente novamente.')
      })
      .finally(() => {
        if (isActive) setIsCheckingMembership(false)
      })

    return () => {
      isActive = false
    }
  }, [navigate])

  function goBack() {
    setFieldError(null)

    if (step === 0) {
      navigate('/welcome', { state: { onboardingRole: 'student' } })
      return
    }

    setStep((current) => current - 1)
  }

  function updateInviteCode(value: string) {
    setInviteCode(value.toUpperCase())
    setVerifiedAcademy(null)
    setFieldError(null)
  }

  async function continueOnboarding() {
    setFieldError(null)

    if (step === 0) {
      if (verifiedAcademy) {
        setStep(1)
        return
      }
      await verifyInvite()
      return
    }

    if (step === 1) {
      if (!nickname.trim()) {
        setFieldError('Informe seu nome no tatame.')
        return
      }
      setStep(2)
      return
    }

    await joinAcademy()
  }

  async function verifyInvite() {
    const normalizedCode = normalizeInviteCode(inviteCode)
    if (!normalizedCode) {
      setFieldError('Informe o código de convite da academia.')
      return
    }

    setIsVerifying(true)
    try {
      const result = await apiClient<{ academy: AcademyIdentity }>('/onboarding/student/verify-invite', {
        method: 'POST',
        body: JSON.stringify({ inviteCode: normalizedCode }),
      })

      if (result.error || !result.data) {
        setVerifiedAcademy(null)
        setFieldError(result.error?.code === 'INVALID_INVITE_CODE'
          ? 'Código inválido. Confirme o código com o professor.'
          : getJoinErrorMessage(result.error?.code))
        return
      }

      setInviteCode(normalizedCode)
      setVerifiedAcademy(result.data.academy)
    } catch {
      setFieldError('Não foi possível verificar o código. Confira sua conexão e tente novamente.')
    } finally {
      setIsVerifying(false)
    }
  }

  async function joinAcademy() {
    const formData = new FormData()
    formData.append('inviteCode', normalizeInviteCode(inviteCode))
    formData.append('nickname', nickname.trim())
    formData.append('belt', belt)
    formData.append('degree', String(degree))
    if (photo) formData.append('photo', photo.file)

    setIsSubmitting(true)
    try {
      const result = await apiClient<StudentMembership>('/onboarding/student', {
        method: 'POST',
        body: formData,
      })

      if (result.error?.code === 'ALREADY_MEMBER') {
        navigate('/student', { replace: true })
        return
      }

      if (result.error || !result.data) {
        if (result.error?.code === 'INVALID_INVITE_CODE') {
          setVerifiedAcademy(null)
          setStep(0)
        }
        setFieldError(getJoinErrorMessage(result.error?.code))
        return
      }

      navigate('/student', {
        replace: true,
        state: {
          membership: result.data,
          notice: `Você entrou na ${result.data.academy.name}.`,
        },
      })
    } catch {
      setFieldError('Não foi possível entrar na academia. Seus dados foram mantidos; tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function selectPhoto(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      setPhotoError(error)
      return
    }

    setPhotoError(null)
    setPhoto({ file, name: file.name, url: URL.createObjectURL(file) })
  }

  if (isCheckingMembership) {
    return (
      <main className="session-loading bb-grain" aria-live="polite">
        <p className="eyebrow">ONBOARDING ALUNO</p>
        <div className="dot-loader" aria-label="Verificando matrícula"><span /><span /><span /></div>
        <p>Verificando seu tatame...</p>
      </main>
    )
  }

  return (
    <main className="onboarding-page bb-grain">
      <StudentOnboardingHeader step={step} onBack={goBack} />
      <section className="onboarding-page__content" key={step}>
        {step === 0 && (
          <InviteCodeStep
            academy={verifiedAcademy}
            code={inviteCode}
            error={fieldError}
            isVerifying={isVerifying}
            onCodeChange={updateInviteCode}
          />
        )}
        {step === 1 && (
          <StudentProfileStep
            error={fieldError}
            nickname={nickname}
            photo={photo}
            photoError={photoError}
            onNicknameChange={(value) => {
              setNickname(value)
              setFieldError(null)
            }}
            onPhotoChange={selectPhoto}
            onPhotoRemove={() => {
              setPhoto(null)
              setPhotoError(null)
            }}
          />
        )}
        {step === 2 && (
          <StudentBeltStep
            belt={belt}
            degree={degree}
            error={fieldError}
            onBeltChange={setBelt}
            onDegreeChange={setDegree}
          />
        )}
      </section>
      <footer className="onboarding-page__footer">
        <button
          aria-busy={isVerifying || isSubmitting}
          className="button button--primary onboarding-page__action"
          disabled={isVerifying || isSubmitting}
          type="button"
          onClick={continueOnboarding}
        >
          {getActionLabel({ step, isVerifying, isSubmitting, isVerified: Boolean(verifiedAcademy) })}
        </button>
      </footer>
    </main>
  )
}

function InviteCodeStep({ academy, code, error, isVerifying, onCodeChange }: {
  academy: AcademyIdentity | null
  code: string
  error: string | null
  isVerifying: boolean
  onCodeChange: (value: string) => void
}) {
  return (
    <div className="onboarding-step page-enter">
      <h1>QUAL O CÓDIGO<br />DA SUA <span>ACADEMIA?</span></h1>
      <p className="onboarding-step__lead">Peça o código de convite ao mestre ou professor responsável.</p>
      <label className="form-field student-invite-field">
        <span>Código de convite</span>
        <input
          autoCapitalize="characters"
          autoComplete="off"
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="BB-ABC123"
          spellCheck={false}
          value={code}
        />
      </label>
      <section className={`student-invite-status${academy ? ' is-verified' : ''}`} aria-live="polite">
        {isVerifying && <><div className="dot-loader"><span /><span /><span /></div><p>Verificando o código...</p></>}
        {!isVerifying && academy && (
          <>
            <span className="student-invite-status__check" aria-hidden="true">✓</span>
            <div><strong>{academy.name}</strong><small>{academy.city.toUpperCase()}</small></div>
          </>
        )}
        {!isVerifying && !academy && <p>Digite o código e toque em verificar.</p>}
      </section>
      {error && <p className="onboarding-notice" role="alert">{error}</p>}
    </div>
  )
}

function StudentProfileStep({ error, nickname, photo, photoError, onNicknameChange, onPhotoChange, onPhotoRemove }: {
  error: string | null
  nickname: string
  photo: ImagePreview | null
  photoError: string | null
  onNicknameChange: (value: string) => void
  onPhotoChange: (event: ChangeEvent<HTMLInputElement>) => void
  onPhotoRemove: () => void
}) {
  return (
    <div className="onboarding-step page-enter">
      <h1>COMO TE CHAMAM<br /><span>NO TATAME?</span></h1>
      <p className="onboarding-step__lead">Este nome aparece para professores e colegas da academia.</p>
      <label className="form-field onboarding-profile-name">
        <span>Nome no tatame</span>
        <input autoComplete="nickname" onChange={(event) => onNicknameChange(event.target.value)} placeholder="Ex.: Bia" value={nickname} />
      </label>
      <StudentPhotoPicker error={photoError} photo={photo} onChange={onPhotoChange} onRemove={onPhotoRemove} />
      {error && <p className="onboarding-notice" role="alert">{error}</p>}
    </div>
  )
}

function StudentPhotoPicker({ error, photo, onChange, onRemove }: {
  error: string | null
  photo: ImagePreview | null
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}) {
  return (
    <section className="image-picker image-picker--photo" aria-labelledby="student-photo-label">
      <div className="image-picker__preview">
        {photo ? <img alt="Prévia da sua foto" src={photo.url} /> : <UploadIcon />}
      </div>
      <div className="image-picker__content">
        <p id="student-photo-label">Sua foto <span>OPCIONAL</span></p>
        <small>{photo ? photo.name : 'JPEG, PNG ou WebP · até 5 MB'}</small>
        <div className="image-picker__actions">
          <label className="image-picker__select" htmlFor="student-photo">{photo ? 'TROCAR' : 'ADICIONAR'}</label>
          {photo && <button className="image-picker__remove" onClick={onRemove} type="button">REMOVER</button>}
        </div>
        <input accept="image/jpeg,image/png,image/webp" className="image-picker__input" id="student-photo" onChange={onChange} type="file" />
        {error && <p className="form-field__error image-picker__error" role="alert">{error}</p>}
      </div>
    </section>
  )
}

function StudentBeltStep({ belt, degree, error, onBeltChange, onDegreeChange }: {
  belt: StudentBeltId
  degree: number
  error: string | null
  onBeltChange: (belt: StudentBeltId) => void
  onDegreeChange: (degree: number) => void
}) {
  const selectedBelt = BELTS.find((item) => item.id === belt)!

  return (
    <div className="onboarding-step page-enter">
      <h1>ONDE VOCÊ<br /><span>ESTÁ HOJE?</span></h1>
      <p className="onboarding-step__lead">Informe sua faixa atual. Depois de entrar, apenas o mestre ou professor poderá alterar sua graduação.</p>
      <fieldset className="belt-picker">
        <legend>Sua faixa</legend>
        <div className="belt-picker__visual" aria-hidden="true">
          <span className="belt-picker__belt" style={{ background: selectedBelt.color }} />
          <span className="belt-picker__tip" />
        </div>
        <div className="belt-picker__summary">
          <div><strong>FAIXA {selectedBelt.label}</strong><small>{degree} GRAU{degree === 1 ? '' : 'S'}</small></div>
          <div className="belt-picker__stripes" aria-label="Quantidade de graus">
            {[0, 1, 2, 3, 4].map((count) => (
              <button aria-label={`${count} ${count === 1 ? 'grau' : 'graus'}`} aria-pressed={degree === count} className={count < degree ? 'is-active' : ''} key={count} onClick={() => onDegreeChange(count)} type="button"><span /></button>
            ))}
          </div>
        </div>
        <div className="belt-picker__choices" role="radiogroup" aria-label="Sua faixa atual">
          {BELTS.map((item) => (
            <button aria-checked={belt === item.id} className={belt === item.id ? 'is-selected' : ''} key={item.id} onClick={() => onBeltChange(item.id)} role="radio" type="button">
              <span className="belt-picker__swatch" style={{ background: item.color }} /><span>{item.label}</span>
            </button>
          ))}
        </div>
      </fieldset>
      {error && <p className="onboarding-notice" role="alert">{error}</p>}
    </div>
  )
}

function StudentOnboardingHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <header className="onboarding-header">
      <div className="onboarding-header__top">
        <button aria-label="Voltar" className="onboarding-header__back" onClick={onBack} type="button">←</button>
        <p className="eyebrow">ONBOARDING ALUNO</p><span aria-hidden="true" />
      </div>
      <div className="onboarding-header__progress" aria-label={`Etapa ${step + 1} de 3`}>
        {[0, 1, 2].map((index) => <span className={index <= step ? 'is-complete' : ''} key={index} />)}
      </div>
      <p className="onboarding-header__caption">ETAPA {String(step + 1).padStart(2, '0')} / 03</p>
    </header>
  )
}

function UploadIcon() {
  return <svg aria-hidden="true" fill="none" viewBox="0 0 24 24"><path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" stroke="currentColor" strokeWidth="1.7" /></svg>
}

function getActionLabel({ step, isVerifying, isSubmitting, isVerified }: { step: number; isVerifying: boolean; isSubmitting: boolean; isVerified: boolean }) {
  if (isVerifying) return 'VERIFICANDO...'
  if (isSubmitting) return 'ENTRANDO NA ACADEMIA...'
  if (step === 0 && !isVerified) return 'Verificar código →'
  if (step === 2) return 'Entrar no tatame →'
  return 'Continuar →'
}

function normalizeInviteCode(value: string) {
  return value.trim().toUpperCase()
}

function validateImageFile(file: File) {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return 'Escolha uma imagem JPEG, PNG ou WebP.'
  if (file.size > 5 * 1024 * 1024) return 'Escolha uma imagem de até 5 MB.'
  return null
}

function getJoinErrorMessage(code: string | undefined) {
  switch (code) {
    case 'MEDIA_UPLOAD_FAILED': return 'Não foi possível enviar sua foto. Seus dados foram mantidos; tente novamente.'
    case 'FILE_TOO_LARGE': return 'Sua foto ultrapassa o limite de 5 MB.'
    case 'INVALID_FILE_TYPE': return 'Envie uma foto JPEG, PNG ou WebP.'
    case 'UNAUTHORIZED': return 'Sua sessão expirou. Entre novamente para continuar.'
    case 'FORBIDDEN': return 'Seu perfil não está configurado como aluno.'
    case 'INVALID_INVITE_CODE': return 'O código não é mais válido. Confirme o código com o professor.'
    default: return 'Não foi possível concluir seu cadastro. Seus dados foram mantidos; tente novamente.'
  }
}

function releasePreview(preview: ImagePreview | null) {
  if (preview) URL.revokeObjectURL(preview.url)
}
