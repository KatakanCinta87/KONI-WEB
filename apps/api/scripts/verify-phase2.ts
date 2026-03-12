import 'dotenv/config'

const API_URL = 'http://localhost:3000/api/v1'

async function runTests() {
    console.log('?? Starting Phase 2 Verification Tests...\n')
    let adminToken = ''
    let adminRefreshToken = ''
    let coachToken = ''
    let sampleAthleteId = ''

    try {
        console.log('Test 1: Admin Login...')
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@koni-kabmalang.or.id',
                password: 'admin123'
            })
        })
        const data: any = await res.json()
        if (data.success && data.data.accessToken && data.data.refreshToken) {
            adminToken = data.data.accessToken
            adminRefreshToken = data.data.refreshToken
            console.log('? Admin Login Success\n')
        } else {
            throw new Error(`Admin login failed: ${JSON.stringify(data)}`)
        }
    } catch (err: any) {
        console.error('? Test 1 Failed:', err.message)
        return
    }

    try {
        console.log('Test 2: Fetch Athletes (Auth Protected)...')
        const res = await fetch(`${API_URL}/athletes`, {
            headers: { 'Authorization': `Bearer ${adminToken}` }
        })
        const data: any = await res.json()
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            sampleAthleteId = data.data[0].id
            console.log(`? Fetch Athletes Success (Got ${data.data.length} athletes)\n`)
        } else {
            throw new Error('Failed to fetch athletes')
        }
    } catch (err: any) {
        console.error('? Test 2 Failed:', err.message)
    }

    try {
        console.log('Test 3: RBAC - Coach Login & Restricted Access...')
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'mulyo.handoyo@coach.koni.id',
                password: 'pelatih123'
            })
        })
        const loginData: any = await loginRes.json()
        coachToken = loginData.data.accessToken
        console.log('  - Coach Login OK')

        const deleteRes = await fetch(`${API_URL}/athletes/${sampleAthleteId}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${coachToken}` }
        })

        if (deleteRes.status === 403) {
            console.log('? RBAC Success: Coach access to DELETE forbidden (403)\n')
        } else {
            const resData = await deleteRes.json()
            throw new Error(`RBAC Failure: Coach should get 403 but got ${deleteRes.status} (${JSON.stringify(resData)})`)
        }
    } catch (err: any) {
        console.error('? Test 3 Failed:', err.message)
    }

    try {
        console.log('Test 4: Refresh Token Flow...')
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: adminRefreshToken })
        })
        const refreshData: any = await refreshRes.json()
        if (refreshData.success && refreshData.data.accessToken && refreshData.data.refreshToken) {
            adminToken = refreshData.data.accessToken
            adminRefreshToken = refreshData.data.refreshToken
            console.log('? Refresh Token Success\n')
        } else {
            throw new Error(`Refresh failed: ${JSON.stringify(refreshData)}`)
        }
    } catch (err: any) {
        console.error('? Test 4 Failed:', err.message)
    }

    try {
        console.log('Test 5: Public API Integrity...')
        const res = await fetch(`${API_URL.replace('/v1', '')}/health`)
        const data: any = await res.json()
        if (data.status === 'ok' && data.database === 'connected') {
            console.log('? Health Check OK')
        }

        const caborRes = await fetch(`${API_URL.replace('/api/v1', '/api')}/v1/cabor`)
        const caborData: any = await caborRes.json()
        if (caborRes.ok && caborData.success) {
            console.log(`? Public Cabor API OK (Found ${caborData.data.length} cabors)\n`)
        }
    } catch (err: any) {
        console.error('? Test 5 Failed:', err.message)
    }

    try {
        console.log('Test 6: Contact Form...')
        const res = await fetch(`${API_URL}/contact`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nama: 'Tester Bot',
                email: 'test@example.com',
                subjek: 'API Verification Test',
                pesan: 'Hello! This is an automated message from verification script.'
            })
        })
        const data: any = await res.json()
        if (data.success) {
            console.log('? Contact Form Success\n')
        } else {
            throw new Error(`Contact form failed: ${JSON.stringify(data)}`)
        }
    } catch (err: any) {
        console.error('? Test 6 Failed:', err.message)
    }

    try {
        console.log('Test 7: Logout Flow...')
        const logoutRes = await fetch(`${API_URL}/auth/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: adminRefreshToken })
        })
        const logoutData: any = await logoutRes.json()
        if (!logoutData.success) {
            throw new Error(`Logout failed: ${JSON.stringify(logoutData)}`)
        }

        const reusedRefreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: adminRefreshToken })
        })

        if (reusedRefreshRes.status === 401) {
            console.log('? Logout revoked refresh token\n')
        } else {
            const reusedData = await reusedRefreshRes.json()
            throw new Error(`Refresh token should be revoked after logout: ${JSON.stringify(reusedData)}`)
        }
    } catch (err: any) {
        console.error('? Test 7 Failed:', err.message)
    }

    try {
        console.log('Test 8: Public News API...')
        const res = await fetch(`${API_URL}/news`)
        const data: any = await res.json()
        if (data.success && Array.isArray(data.data)) {
            console.log(`? Public News API OK (Found ${data.data.length} news items)\n`)
        } else {
            throw new Error(`Public news failed: ${JSON.stringify(data)}`)
        }
    } catch (err: any) {
        console.error('? Test 8 Failed:', err.message)
    }

    console.log('?? Verification Tests Completed.')
}

runTests()
