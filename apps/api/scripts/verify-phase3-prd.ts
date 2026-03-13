import 'dotenv/config'
import assert from 'node:assert/strict'

const API_URL = 'http://localhost:3000/api/v1'

async function loginAdmin() {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@koni-kabmalang.or.id', password: 'admin123' }),
  })
  const data: any = await res.json()
  if (!data.success) throw new Error(`Login gagal: ${JSON.stringify(data)}`)
  return data.data.accessToken as string
}

async function loginCaborAdmin(email: string, password: string) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data: any = await res.json()
  if (!data.success) throw new Error(`Login CABOR_ADMIN gagal (${email}): ${JSON.stringify(data)}`)
  return data.data.accessToken as string
}

async function run() {
  console.log('Starting Phase 3 PRD Closure verification...')
  
  const token = await loginAdmin()
  const pssiAdminToken = await loginCaborAdmin('admin-pssi@koni-kabmalang.or.id', 'cabor123')

  // Get Events
  const eventRes = await fetch(`${API_URL}/admin/events`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const eventData: any = await eventRes.json()
  if (!eventData.success || !eventData.data?.length) throw new Error('Tidak ada event untuk verifikasi')
  const eventId = eventData.data[0].id

  // Get Athletes representing PSSI
  const caborRes = await fetch(`${API_URL}/cabor`)
  const caborData: any = await caborRes.json()
  const pssiCabor = caborData.data.find((c: any) => c.name === 'PSSI')
  if (!pssiCabor) throw new Error('Cabor PSSI tidak ditemukan')

  const athletesRes = await fetch(`${API_URL}/admin/athletes?caborId=${pssiCabor.id}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const athletesData: any = await athletesRes.json()
  let athleteParam = athletesData.data?.[0]
  
  if (!athleteParam) {
    // try any athlete if PSSI has none (just for test resilience)
    const anyAthleteRes = await fetch(`${API_URL}/admin/athletes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    const anyAthleteData: any = await anyAthleteRes.json()
    athleteParam = anyAthleteData.data?.[0]
    if (!athleteParam) throw new Error('Tidak ada atlet di database untuk registrasi')
  }

  const athleteId = athleteParam.id

  // 1. EVENT REGISTRATION
  console.log('Testing Event Registration...')
  const registerRes = await fetch(`${API_URL}/admin/events/${eventId}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${pssiAdminToken}` },
    body: JSON.stringify({
      athleteId,
      matchNumber: '100M-SPRINT',
      notes: 'Test Athlete Registration Phase 3',
    }),
  })
  const registerData: any = await registerRes.json()
  // Might return 400 if already registered, handle gracefully
  let registrationId: string
  if (registerRes.status === 400 && registerData.error.includes('sudah terdaftar')) {
    console.log(' > Atlet sudah terdaftar, mengambil id registrasi...')
    const currentRegRes = await fetch(`${API_URL}/admin/events/${eventId}/registrations`, {
      headers: { Authorization: `Bearer ${pssiAdminToken}` },
    })
    const currentRegData: any = await currentRegRes.json()
    const reg = currentRegData.data.find((r: any) => r.athleteId === athleteId)
    assert.ok(reg, 'Registrasi tidak ditemukan padahal status 400 sudah terdaftar')
    registrationId = reg.id
  } else {
    // New Registration
    if (!registerData.success) throw new Error(`Registrasi gagal: ${JSON.stringify(registerData)}`)
    registrationId = registerData.data.id
    console.log(' > Registrasi sukses dibuat.', registrationId)
  }

  // View Registrations
  const viewRegRes = await fetch(`${API_URL}/admin/events/${eventId}/registrations`, {
    headers: { Authorization: `Bearer ${pssiAdminToken}` },
  })
  const viewRegData: any = await viewRegRes.json()
  assert.ok(viewRegData.success && viewRegData.data.length > 0, 'Gagal mengambil view registrations')
  console.log(' > Daftar registrasi:', viewRegData.data.length, 'data ditemukan.')

  // Delete Registration
  const delRegRes = await fetch(`${API_URL}/admin/events/registrations/${registrationId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${pssiAdminToken}` },
  })
  const delRegData: any = await delRegRes.json()
  if (!delRegData.success) throw new Error(`Hapus registrasi gagal: ${JSON.stringify(delRegData)}`)
  console.log(' > Registrasi atlet berhasil dibersihkan.')


  // 2. EXPORT ENDPOINTS
  console.log('Testing Export Endpoints...')
  
  // Excel
  const excelRes = await fetch(`${API_URL}/admin/events/${eventId}/export/excel`, {
    headers: { Authorization: `Bearer ${pssiAdminToken}` },
  })
  assert.strictEqual(excelRes.status, 200, 'Export Excel endpoint failed')
  const excelContentType = excelRes.headers.get('content-type')
  assert.ok(
    excelContentType?.includes('spreadsheetml.sheet'),
    `Incorrect content type for Excel: ${excelContentType}`
  )
  console.log(' > Export Excel (XLSX) response OK, content-type verified')

  // PDF
  const pdfRes = await fetch(`${API_URL}/admin/events/${eventId}/export/pdf`, {
    headers: { Authorization: `Bearer ${pssiAdminToken}` },
  })
  assert.strictEqual(pdfRes.status, 200, 'Export PDF endpoint failed')
  const pdfContentType = pdfRes.headers.get('content-type')
  assert.ok(
    pdfContentType?.includes('application/pdf'),
    `Incorrect content type for PDF: ${pdfContentType}`
  )
  console.log(' > Export PDF response OK, content-type verified')


  console.log('\\n✅ Phase 3 PRD Closure Verification COMPLETE dan BERHASIL!')
}

run().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
