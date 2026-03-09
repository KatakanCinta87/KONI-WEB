import toast from 'react-hot-toast'
import { UseFormSetError } from 'react-hook-form'

/**
 * Helper to handle API errors and map validation errors to react-hook-form
 */
export function handleApiError(error: any, setError?: UseFormSetError<any>) {
  console.error('API Error:', error)
  
  const response = error.response?.data
  const errorMessage = response?.error || error.message || 'Terjadi kesalahan pada sistem'
  
  // 1. Show main error message via toast
  toast.error(errorMessage)
  
  // 2. If it's a validation error and we have setError, map fields
  if (response?.code === 'VALIDATION_ERROR' && response.fields && setError) {
    Object.keys(response.fields).forEach((field) => {
      setError(field as any, {
        type: 'server',
        message: response.fields[field]
      })
    })
  }
  
  return errorMessage
}
