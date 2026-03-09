import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASS || 'pass',
  },
})

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`

  const mailOptions = {
    from: `"KONI Kab. Malang" <${process.env.SMTP_USER || 'noreply@koni-kabmalang.or.id'}>`,
    to: email,
    subject: 'Reset Password - KONI Kab. Malang',
    html: `
      <h1>Permintaan Reset Password</h1>
      <p>Anda menerima email ini karena kami menerima permintaan reset password untuk akun Anda.</p>
      <p>Silakan klik tautan di bawah ini untuk mereset password Anda:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>Tautan ini akan kedaluwarsa dalam 1 jam.</p>
      <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
    `,
  }

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('📧 [MOCK EMAIL] Reset link for', email, ':', resetUrl)
    return
  }

  try {
    await transporter.sendMail(mailOptions)
    console.log('📧 Password reset email sent to', email)
  } catch (error) {
    console.error('❌ Failed to send reset email:', error)
    throw new Error('Gagal mengirim email reset password')
  }
}
