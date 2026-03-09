import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'

export function validate(schema: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate req.body against schema
      req.body = await schema.parseAsync(req.body)
      next()
    } catch (error) {
      if (error instanceof ZodError) {
        // Format ZodError to be user-friendly
        const fields: Record<string, string> = {}
        error.issues.forEach((err: any) => {
          const path = err.path.join('.')
          fields[path] = err.message
        })

        res.status(422).json({
          success: false,
          error: 'Validasi input gagal',
          code: 'VALIDATION_ERROR',
          fields,
        })
        return
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error during validation',
        code: 'INTERNAL_ERROR',
      })
    }
  }
}
