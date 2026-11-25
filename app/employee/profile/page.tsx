'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession, signIn } from 'next-auth/react'
import { ArrowLeft, Save, User, Phone, MapPin, HeartPulse, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Loading } from '@/components/ui/Loading'
import { ShiftConfigForm } from '@/components/ShiftConfigForm'
import { SELF_EDITABLE_PROFILE_FIELDS, validateSelfProfileForm } from '@/lib/profile-validation'

type Shift = 'MORNING' | 'AFTERNOON' | 'NIGHT' | 'HYBRID'

interface ProfileForm {
  phone: string
  address: string
  emergencyContact: string
  emergencyPhone: string
  shift: Shift
  shiftStartTime: string
  shiftEndTime: string
  workingDaysPerWeek: number
}

interface ProfileInfo {
  name: string
  email: string
  department?: string | null
  registrationNumber?: string | null
  contractType?: string
}

const formatPhone = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11)
  if (numbers.length <= 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
}

export default function EmployeeProfilePage() {
  const { data: session, status } = useSession()
  const [info, setInfo] = useState<ProfileInfo | null>(null)
  const [initial, setInitial] = useState<ProfileForm | null>(null)
  const [form, setForm] = useState<ProfileForm | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!session?.user?.id) return
    let cancelled = false
    const load = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users/${session.user.id}`)
        if (!response.ok) throw new Error('load failed')
        const data = await response.json()
        if (cancelled) return
        const loaded: ProfileForm = {
          phone: data.phone || '',
          address: data.address || '',
          emergencyContact: data.emergencyContact || '',
          emergencyPhone: data.emergencyPhone || '',
          shift: (data.shift as Shift) || 'MORNING',
          shiftStartTime: data.shiftStartTime || '08:00',
          shiftEndTime: data.shiftEndTime || '12:00',
          workingDaysPerWeek: data.workingDaysPerWeek || 5,
        }
        setInfo({
          name: data.name,
          email: data.email,
          department: data.department,
          registrationNumber: data.registrationNumber,
          contractType: data.contractType,
        })
        setInitial(loaded)
        setForm(loaded)
      } catch {
        if (!cancelled) {
          setErrors({ general: 'Não foi possível carregar seu perfil. Recarregue a página.' })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [session?.user?.id])

  const setField = (field: string, value: string | number | boolean) => {
    setSaved(false)
    setForm((prev) => (prev ? { ...prev, [field]: value } : prev))
    setErrors((prev) => {
      if (!prev[field] && !prev.general) return prev
      const next = { ...prev }
      delete next[field]
      delete next.general
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form || !initial || !session?.user?.id) return

    const validation = validateSelfProfileForm(form)
    setErrors(validation)
    if (Object.keys(validation).length > 0) return

    const changed: Partial<ProfileForm> = {}
    for (const key of SELF_EDITABLE_PROFILE_FIELDS) {
      if (form[key] !== initial[key]) {
        ;(changed as Record<string, unknown>)[key] =
          typeof form[key] === 'string' ? (form[key] as string).trim() : form[key]
      }
    }
    if (Object.keys(changed).length === 0) {
      setSaved(true)
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`/api/users/${session.user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(changed),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setErrors({
          ...(data.fieldErrors || {}),
          general: data.error || 'Não foi possível salvar. Tente novamente.',
        })
        return
      }
      setInitial(form)
      setSaved(true)
    } catch {
      setErrors({ general: 'Erro de conexão. Verifique a internet e tente novamente.' })
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || (session && loading)) {
    return <Loading />
  }

  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-neutral-900 text-white p-4">
        <h1 className="text-2xl font-bold mb-4">Sessão expirada</h1>
        <p className="text-neutral-400 mb-6 text-center max-w-md">
          Sua sessão expirou ou você não está autenticado.
        </p>
        <Button onClick={() => signIn()}>Fazer login</Button>
      </div>
    )
  }

  const isEmployee = session.user.role === 'EMPLOYEE'
  const inputClass = (field: string) =>
    `w-full px-4 py-2 bg-neutral-700 border ${errors[field] ? 'border-error' : 'border-neutral-600'} rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary`
  const fieldError = (field: string) =>
    errors[field] ? (
      <p role="alert" className="mt-1 text-xs text-error">
        {errors[field]}
      </p>
    ) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-4 sm:p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href={isEmployee ? '/employee' : '/admin'}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Link>
          </Button>
        </div>

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Meu perfil</h1>
          <p className="text-neutral-400">
            Atualize seus contatos e seu horário de estágio, por exemplo quando o horário das aulas
            mudar.
          </p>
        </div>

        {info && (
          <div className="mb-6 bg-neutral-800 rounded-lg p-4 border border-neutral-700 flex items-start gap-3">
            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="text-sm">
              <p className="text-white font-medium">{info.name}</p>
              <p className="text-neutral-400">{info.email}</p>
              <p className="text-neutral-400">
                {info.department ? `Setor: ${info.department}` : null}
                {info.department && info.registrationNumber ? ' · ' : null}
                {info.registrationNumber ? `Matrícula: ${info.registrationNumber}` : null}
              </p>
              <p className="text-neutral-500 text-xs mt-2">
                Nome, e-mail, setor, matrícula e contrato só podem ser alterados pela coordenação.
              </p>
            </div>
          </div>
        )}

        {!form ? (
          errors.general && (
            <div className="p-4 bg-error/20 border border-error/50 rounded-lg text-error text-sm">
              {errors.general}
            </div>
          )
        ) : !isEmployee ? (
          <div className="p-4 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-300 text-sm">
            Esta tela é para alunos e estagiários. Administradores editam usuários em Administração
            › Usuários.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6" noValidate>
            {errors.general && (
              <div
                role="alert"
                className="p-4 bg-error/20 border border-error/50 rounded-lg text-error text-sm"
              >
                {errors.general}
              </div>
            )}
            {saved && (
              <div
                role="status"
                className="p-4 bg-success/10 border border-success/40 rounded-lg text-success text-sm flex items-center gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Perfil salvo. O novo horário já vale para os próximos registros e avisos.
              </div>
            )}

            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 space-y-4">
              <h2 className="text-lg font-semibold text-white">Contato</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="profile-phone" className="block text-sm text-white mb-2">
                    <Phone className="inline h-4 w-4 mr-1" />
                    Telefone
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="(85) 99999-9999"
                    className={inputClass('phone')}
                    value={form.phone}
                    onChange={(e) => setField('phone', formatPhone(e.target.value))}
                  />
                  {fieldError('phone')}
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="profile-address" className="block text-sm text-white mb-2">
                    <MapPin className="inline h-4 w-4 mr-1" />
                    Endereço
                  </label>
                  <textarea
                    id="profile-address"
                    rows={2}
                    placeholder="Rua, número, bairro, cidade e CEP"
                    className={`${inputClass('address')} resize-none`}
                    value={form.address}
                    onChange={(e) => setField('address', e.target.value)}
                  />
                  {fieldError('address')}
                </div>
              </div>
            </div>

            <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 space-y-4">
              <h2 className="text-lg font-semibold text-white">
                <HeartPulse className="inline h-5 w-5 mr-1" />
                Contato de emergência
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label
                    htmlFor="profile-emergency-contact"
                    className="block text-sm text-white mb-2"
                  >
                    Nome
                  </label>
                  <input
                    id="profile-emergency-contact"
                    type="text"
                    className={inputClass('emergencyContact')}
                    value={form.emergencyContact}
                    onChange={(e) => setField('emergencyContact', e.target.value)}
                  />
                  {fieldError('emergencyContact')}
                </div>
                <div>
                  <label
                    htmlFor="profile-emergency-phone"
                    className="block text-sm text-white mb-2"
                  >
                    Telefone
                  </label>
                  <input
                    id="profile-emergency-phone"
                    type="tel"
                    inputMode="tel"
                    placeholder="(85) 99999-9999"
                    className={inputClass('emergencyPhone')}
                    value={form.emergencyPhone}
                    onChange={(e) => setField('emergencyPhone', formatPhone(e.target.value))}
                  />
                  {fieldError('emergencyPhone')}
                </div>
              </div>
            </div>

            <ShiftConfigForm
              shift={form.shift}
              shiftStartTime={form.shiftStartTime}
              shiftEndTime={form.shiftEndTime}
              workingDaysPerWeek={form.workingDaysPerWeek}
              allowFlexibleHours={false}
              contractType={info?.contractType}
              onChange={setField}
              errors={errors}
              showFlexibleHours={false}
            />
            {fieldError('workingDaysPerWeek')}

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="min-w-[150px]">
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
