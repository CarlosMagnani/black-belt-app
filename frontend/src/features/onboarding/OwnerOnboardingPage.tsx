import { useEffect, useMemo, useState } from 'react'
import type { ChangeEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiClient } from '../../lib/api'

const BELTS = [
  { id: 'white', label: 'BRANCA', color: '#E9E9E9' },
  { id: 'blue', label: 'AZUL', color: '#3557C8' },
  { id: 'purple', label: 'ROXA', color: '#6F3A9B' },
  { id: 'brown', label: 'MARROM', color: '#70402B' },
  { id: 'black', label: 'PRETA', color: '#171717' },
] as const

type BeltId = (typeof BELTS)[number]['id']
type FieldErrors = Partial<Record<'academyName' | 'city' | 'professorName' | 'belt', string>>
type ImageKind = 'academyLogo' | 'ownerPhoto'
type ImageErrors = Partial<Record<ImageKind, string>>

type ImagePreview = {
  file: File
  name: string
  url: string
}

type OwnerOnboardingResponse = {
  academy: {
    city: string
    id: string
    inviteCode: string
    logoUrl: string | null
    name: string
  }
  owner: {
    avatarUrl: string | null
    belt: BeltId
    degree: number
    fullName: string
    id: string
    nickname: string | null
  }
}

export function OwnerOnboardingPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [academyName, setAcademyName] = useState('')
  const [city, setCity] = useState('')
  const [professorName, setProfessorName] = useState('')
  const [belt, setBelt] = useState<BeltId | null>(null)
  const [stripes, setStripes] = useState(0)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [academyLogo, setAcademyLogo] = useState<ImagePreview | null>(null)
  const [ownerPhoto, setOwnerPhoto] = useState<ImagePreview | null>(null)
  const [imageErrors, setImageErrors] = useState<ImageErrors>({})
  const [inviteNotice, setInviteNotice] = useState<string | null>(null)
  const [createdAcademy, setCreatedAcademy] = useState<OwnerOnboardingResponse | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  useEffect(() => () => releasePreview(academyLogo), [academyLogo])
  useEffect(() => () => releasePreview(ownerPhoto), [ownerPhoto])

  function goBack() {
    if (step === 0) {
      navigate('/boas-vindas', { state: { onboardingRole: 'owner' } })
      return
    }

    if (step === 2) {
      navigate('/mestre', { replace: true })
      return
    }

    setErrors({})
    setInviteNotice(null)
    setSubmissionError(null)
    setStep((currentStep) => currentStep - 1)
  }

  async function continueOnboarding() {
    const nextErrors = validateStep(step, { academyName, city, professorName, belt })
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setInviteNotice(null)
    setSubmissionError(null)

    if (step === 0) {
      setStep(1)
      return
    }

    if (step === 1 && belt) {
      await submitOwnerOnboarding(belt)
    }
  }

  async function submitOwnerOnboarding(selectedBelt: BeltId) {
    const formData = new FormData()
    formData.append('academyName', academyName.trim())
    formData.append('academyCity', city.trim())
    formData.append('ownerNickname', professorName.trim())
    formData.append('ownerBelt', selectedBelt)
    formData.append('ownerDegree', String(stripes))

    if (academyLogo) formData.append('logo', academyLogo.file)
    if (ownerPhoto) formData.append('photo', ownerPhoto.file)

    setIsSubmitting(true)

    try {
      const result = await apiClient<OwnerOnboardingResponse>('/onboarding/owner', {
        method: 'POST',
        body: formData,
      })

      if (result.error?.code === 'ACADEMY_EXISTS') {
        navigate('/mestre', {
          replace: true,
          state: { notice: 'Sua academia já está criada.' },
        })
        return
      }

      if (result.error || !result.data) {
        setSubmissionError(getOnboardingErrorMessage(result.error?.code))
        return
      }

      setCreatedAcademy(result.data)
      setStep(2)
    } catch {
      setSubmissionError('Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function copyInviteCode() {
    if (!createdAcademy) return

    try {
      await navigator.clipboard.writeText(createdAcademy.academy.inviteCode)
      setInviteNotice('Código de convite copiado.')
    } catch {
      setInviteNotice('Não foi possível copiar. Selecione o código para copiar.')
    }
  }

  async function shareInviteCode() {
    if (!createdAcademy) return

    if (!navigator.share) {
      setInviteNotice('Compartilhamento não está disponível neste dispositivo.')
      return
    }

    try {
      await navigator.share({
        title: `Convite para ${createdAcademy.academy.name}`,
        text: `Use o código ${createdAcademy.academy.inviteCode} para entrar na academia ${createdAcademy.academy.name}.`,
      })
      setInviteNotice('Convite aberto para compartilhamento.')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return
      }

      setInviteNotice('Não foi possível compartilhar o convite.')
    }
  }

  function handleImageSelection(kind: ImageKind, event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file) return

    const error = validateImageFile(file)
    if (error) {
      setImageErrors((currentErrors) => ({ ...currentErrors, [kind]: error }))
      return
    }

    const preview = { file, name: file.name, url: URL.createObjectURL(file) }
    setImageErrors((currentErrors) => ({ ...currentErrors, [kind]: undefined }))

    if (kind === 'academyLogo') {
      setAcademyLogo(preview)
      return
    }

    setOwnerPhoto(preview)
  }

  function removeImage(kind: ImageKind) {
    setImageErrors((currentErrors) => ({ ...currentErrors, [kind]: undefined }))

    if (kind === 'academyLogo') {
      setAcademyLogo(null)
      return
    }

    setOwnerPhoto(null)
  }

  return (
    <main className="onboarding-page bb-grain">
      <OnboardingHeader step={step} onBack={goBack} />
      <section className="onboarding-page__content" key={step}>
        {step === 0 && (
          <AcademyStep
            academyName={academyName}
            academyLogo={academyLogo}
            city={city}
            errors={errors}
            imageError={imageErrors.academyLogo}
            onAcademyNameChange={(value) => {
              setAcademyName(value)
              setErrors((currentErrors) => ({ ...currentErrors, academyName: undefined }))
            }}
            onCityChange={(value) => {
              setCity(value)
              setErrors((currentErrors) => ({ ...currentErrors, city: undefined }))
            }}
            onImageChange={(event) => handleImageSelection('academyLogo', event)}
            onImageRemove={() => removeImage('academyLogo')}
          />
        )}
        {step === 1 && (
          <ProfileStep
            belt={belt}
            errors={errors}
            imageError={imageErrors.ownerPhoto}
            ownerPhoto={ownerPhoto}
            professorName={professorName}
            stripes={stripes}
            onBeltChange={(value) => {
              setBelt(value)
              setErrors((currentErrors) => ({ ...currentErrors, belt: undefined }))
            }}
            onProfessorNameChange={(value) => {
              setProfessorName(value)
              setErrors((currentErrors) => ({ ...currentErrors, professorName: undefined }))
            }}
            onImageChange={(event) => handleImageSelection('ownerPhoto', event)}
            onImageRemove={() => removeImage('ownerPhoto')}
            onStripesChange={setStripes}
          />
        )}
        {step === 2 && createdAcademy && (
          <InviteStep
            academyName={createdAcademy.academy.name}
            code={createdAcademy.academy.inviteCode}
            notice={inviteNotice}
            onCopy={copyInviteCode}
            onShare={shareInviteCode}
          />
        )}
      </section>
      <footer className="onboarding-page__footer">
        {submissionError && <p className="onboarding-submit-error" role="alert">{submissionError}</p>}
        <button
          aria-busy={isSubmitting}
          className="button button--primary onboarding-page__action"
          disabled={isSubmitting}
          type="button"
          onClick={step === 2 ? () => navigate('/mestre', { replace: true }) : continueOnboarding}
        >
          {isSubmitting ? 'CRIANDO ACADEMIA...' : step === 2 ? 'Abrir academia →' : 'Continuar →'}
        </button>
      </footer>
    </main>
  )
}

function AcademyStep({
  academyName,
  academyLogo,
  city,
  errors,
  imageError,
  onAcademyNameChange,
  onCityChange,
  onImageChange,
  onImageRemove,
}: {
  academyName: string
  academyLogo: ImagePreview | null
  city: string
  errors: FieldErrors
  imageError?: string
  onAcademyNameChange: (value: string) => void
  onCityChange: (value: string) => void
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void
  onImageRemove: () => void
}) {
  return (
    <div className="onboarding-step page-enter">
      <h1>FUNDE SUA<br /><span>ACADEMIA.</span></h1>
      <p className="onboarding-step__lead">Comece pelo nome do seu tatame. Instrutores, mensalidades e horários entram depois.</p>
      <div className="onboarding-fields">
        <label className="form-field">
          <span>Nome da academia</span>
          <input autoComplete="organization" aria-invalid={Boolean(errors.academyName)} onChange={(event) => onAcademyNameChange(event.target.value)} placeholder="Ex.: Black Belt SP" value={academyName} />
          {errors.academyName && <small className="form-field__error">{errors.academyName}</small>}
        </label>
        <label className="form-field">
          <span>Cidade · País</span>
          <input autoComplete="address-level2" aria-invalid={Boolean(errors.city)} onChange={(event) => onCityChange(event.target.value)} placeholder="Ex.: São Paulo, Brasil" value={city} />
          {errors.city && <small className="form-field__error">{errors.city}</small>}
        </label>
      </div>
      <ImagePicker
        error={imageError}
        inputId="academy-logo"
        kind="logo"
        label="Logo da academia"
        preview={academyLogo}
        onChange={onImageChange}
        onRemove={onImageRemove}
      />
      <aside className="onboarding-info">
        <span className="onboarding-info__dot" aria-hidden="true" />
        <p>Você será o <strong>mestre</strong> com acesso total. Convide outros instrutores depois.</p>
      </aside>
    </div>
  )
}

function ProfileStep({
  belt,
  errors,
  imageError,
  ownerPhoto,
  professorName,
  stripes,
  onBeltChange,
  onImageChange,
  onImageRemove,
  onProfessorNameChange,
  onStripesChange,
}: {
  belt: BeltId | null
  errors: FieldErrors
  imageError?: string
  ownerPhoto: ImagePreview | null
  professorName: string
  stripes: number
  onBeltChange: (value: BeltId) => void
  onImageChange: (event: ChangeEvent<HTMLInputElement>) => void
  onImageRemove: () => void
  onProfessorNameChange: (value: string) => void
  onStripesChange: (value: number) => void
}) {
  return (
    <div className="onboarding-step page-enter">
      <h1>QUEM É O<br /><span>PROFESSOR?</span></h1>
      <p className="onboarding-step__lead">Sua faixa aparece no perfil e nas promoções de aluno.</p>
      <label className="form-field onboarding-profile-name">
        <span>Nome no tatame</span>
        <input autoComplete="name" aria-invalid={Boolean(errors.professorName)} onChange={(event) => onProfessorNameChange(event.target.value)} placeholder="Ex.: Professor Carlos" value={professorName} />
        {errors.professorName && <small className="form-field__error">{errors.professorName}</small>}
      </label>
      <ImagePicker
        error={imageError}
        inputId="owner-photo"
        kind="photo"
        label="Sua foto"
        preview={ownerPhoto}
        onChange={onImageChange}
        onRemove={onImageRemove}
      />
      <BeltPicker belt={belt} error={errors.belt} stripes={stripes} onBeltChange={onBeltChange} onStripesChange={onStripesChange} />
    </div>
  )
}

function ImagePicker({
  error,
  inputId,
  kind,
  label,
  preview,
  onChange,
  onRemove,
}: {
  error?: string
  inputId: string
  kind: 'logo' | 'photo'
  label: string
  preview: ImagePreview | null
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  onRemove: () => void
}) {
  const previewDescription = kind === 'logo' ? 'Prévia do logo da academia' : 'Prévia da sua foto'

  return (
    <section className={`image-picker image-picker--${kind}`} aria-labelledby={`${inputId}-label`}>
      <div className="image-picker__preview">
        {preview ? <img alt={previewDescription} src={preview.url} /> : <UploadIcon />}
      </div>
      <div className="image-picker__content">
        <p id={`${inputId}-label`}>{label} <span>OPCIONAL</span></p>
        <small>{preview ? preview.name : 'JPEG, PNG ou WebP · até 5 MB'}</small>
        <div className="image-picker__actions">
          <label className="image-picker__select" htmlFor={inputId}>{preview ? 'TROCAR' : 'ADICIONAR'}</label>
          {preview && <button className="image-picker__remove" onClick={onRemove} type="button">REMOVER</button>}
        </div>
        <input accept="image/jpeg,image/png,image/webp" className="image-picker__input" id={inputId} onChange={onChange} type="file" />
        {error && <p className="form-field__error image-picker__error" role="alert">{error}</p>}
      </div>
    </section>
  )
}

function UploadIcon() {
  return (
    <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
      <path d="M12 16V4m0 0L7.5 8.5M12 4l4.5 4.5M5 14v5h14v-5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function BeltPicker({
  belt,
  error,
  stripes,
  onBeltChange,
  onStripesChange,
}: {
  belt: BeltId | null
  error?: string
  stripes: number
  onBeltChange: (value: BeltId) => void
  onStripesChange: (value: number) => void
}) {
  const selectedBelt = BELTS.find((item) => item.id === belt)

  return (
    <fieldset className="belt-picker" aria-describedby={error ? 'belt-error' : undefined}>
      <legend>Faixa</legend>
      <div className={`belt-picker__visual${selectedBelt ? '' : ' belt-picker__visual--empty'}`} aria-hidden="true">
        <span className="belt-picker__belt" style={{ background: selectedBelt?.color }} />
        <span className="belt-picker__tip" />
      </div>
      <div className="belt-picker__summary">
        <div>
          <strong>{selectedBelt ? `FAIXA ${selectedBelt.label}` : 'SELECIONE A FAIXA'}</strong>
          <small>{stripes} GRAU{stripes === 1 ? '' : 'S'}</small>
        </div>
        <div className="belt-picker__stripes" aria-label="Quantidade de graus">
          {[0, 1, 2, 3, 4].map((count) => (
            <button aria-label={`${count} ${count === 1 ? 'grau' : 'graus'}`} aria-pressed={stripes === count} className={count < stripes ? 'is-active' : ''} key={count} onClick={() => onStripesChange(count)} type="button">
              <span />
            </button>
          ))}
        </div>
      </div>
      <div className="belt-picker__choices" role="radiogroup" aria-label="Sua faixa">
        {BELTS.map((item) => (
          <button aria-checked={belt === item.id} className={belt === item.id ? 'is-selected' : ''} key={item.id} onClick={() => onBeltChange(item.id)} role="radio" type="button">
            <span className="belt-picker__swatch" style={{ background: item.color }} />
            <span>{item.label}</span>
          </button>
        ))}
      </div>
      {error && <p className="form-field__error belt-picker__error" id="belt-error">{error}</p>}
    </fieldset>
  )
}

function InviteStep({
  academyName,
  code,
  notice,
  onCopy,
  onShare,
}: {
  academyName: string
  code: string
  notice: string | null
  onCopy: () => void
  onShare: () => void
}) {
  return (
    <div className="onboarding-step page-enter">
      <h1>SUA PORTA DE<br /><span>ENTRADA.</span></h1>
      <p className="onboarding-step__lead">Compartilhe este código com os alunos para que entrem na <strong>{academyName}</strong>.</p>
      <section className="invite-code-card" aria-label="Código de convite da academia">
        <span className="invite-code-card__corner invite-code-card__corner--top-left" aria-hidden="true" />
        <span className="invite-code-card__corner invite-code-card__corner--top-right" aria-hidden="true" />
        <span className="invite-code-card__corner invite-code-card__corner--bottom-left" aria-hidden="true" />
        <span className="invite-code-card__corner invite-code-card__corner--bottom-right" aria-hidden="true" />
        <p>CÓDIGO DE CONVITE</p>
        <output>{code}</output>
        <small>30 DIAS QUANDO ATIVO · ROTACIONÁVEL</small>
      </section>
      <div className="invite-actions">
        <button className="button button--ghost" onClick={onCopy} type="button">COPIAR</button>
        <button className="button button--ghost" onClick={onShare} type="button">COMPARTILHAR</button>
      </div>
      {notice && <p className="onboarding-notice" role="status">{notice}</p>}
      <section className="invite-qr-card">
        <div className="invite-qr-card__code" aria-hidden="true"><QrPreview seed={code} /></div>
        <div>
          <p className="eyebrow">QR CODE</p>
          <p>A versão escaneável do convite será disponibilizada em uma próxima etapa.</p>
        </div>
      </section>
    </div>
  )
}

function OnboardingHeader({ step, onBack }: { step: number; onBack: () => void }) {
  return (
    <header className="onboarding-header">
      <div className="onboarding-header__top">
        <button aria-label="Voltar" className="onboarding-header__back" onClick={onBack} type="button">←</button>
        <p className="eyebrow">ONBOARDING MESTRE</p>
        <span aria-hidden="true" />
      </div>
      <div className="onboarding-header__progress" aria-label={`Etapa ${step + 1} de 3`}>
        {[0, 1, 2].map((index) => <span className={index <= step ? 'is-complete' : ''} key={index} />)}
      </div>
      <p className="onboarding-header__caption">ETAPA {String(step + 1).padStart(2, '0')} / 03</p>
    </header>
  )
}

function QrPreview({ seed }: { seed: string }) {
  const cells = useMemo(() => buildQrCells(seed), [seed])

  return (
    <svg viewBox="0 0 9 9" width="44" height="44">
      {cells.map((row, rowIndex) => row.map((isFilled, columnIndex) => (
        isFilled ? <rect fill="#0A0A0A" height="1" key={`${rowIndex}-${columnIndex}`} width="1" x={columnIndex} y={rowIndex} /> : null
      )))}
    </svg>
  )
}

function validateStep(step: number, values: { academyName: string; city: string; professorName: string; belt: BeltId | null }) {
  const errors: FieldErrors = {}

  if (step === 0) {
    if (!values.academyName.trim()) errors.academyName = 'Informe o nome da academia.'
    if (!values.city.trim()) errors.city = 'Informe a cidade da academia.'
  }

  if (step === 1) {
    if (!values.professorName.trim()) errors.professorName = 'Informe o seu nome.'
    if (!values.belt) errors.belt = 'Selecione a sua faixa.'
  }

  return errors
}

function validateImageFile(file: File) {
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (!acceptedTypes.includes(file.type)) {
    return 'Escolha uma imagem JPEG, PNG ou WebP.'
  }

  if (file.size > 5 * 1024 * 1024) {
    return 'Escolha uma imagem de até 5 MB.'
  }

  return null
}

function getOnboardingErrorMessage(code: string | undefined) {
  switch (code) {
    case 'MEDIA_UPLOAD_FAILED':
      return 'Não foi possível enviar uma das imagens. Seus dados foram mantidos; tente novamente.'
    case 'FILE_TOO_LARGE':
      return 'Uma das imagens ultrapassa o limite de 5 MB.'
    case 'INVALID_FILE_TYPE':
      return 'Envie apenas imagens JPEG, PNG ou WebP.'
    case 'UNAUTHORIZED':
      return 'Sua sessão expirou. Entre novamente para concluir o cadastro.'
    case 'FORBIDDEN':
      return 'Seu perfil não está configurado como mestre. Volte e selecione o perfil correto.'
    default:
      return 'Não foi possível criar a academia. Seus dados foram mantidos; tente novamente.'
  }
}

function releasePreview(preview: ImagePreview | null) {
  if (preview) URL.revokeObjectURL(preview.url)
}

function buildQrCells(seed: string) {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) hash = (hash * 31 + seed.charCodeAt(index)) >>> 0

  const cells = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => {
    hash = (hash * 1103515245 + 12345) >>> 0
    return Boolean((hash >> 8) & 1)
  }))

  for (const [row, column] of [[0, 0], [0, 6], [6, 0]]) {
    for (let rowOffset = 0; rowOffset < 3; rowOffset += 1) {
      for (let columnOffset = 0; columnOffset < 3; columnOffset += 1) {
        cells[row + rowOffset][column + columnOffset] = true
      }
    }
  }

  return cells
}
