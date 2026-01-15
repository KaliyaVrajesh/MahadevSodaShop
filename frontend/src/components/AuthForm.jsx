import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '../stores/authStore'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const registerSchema = loginSchema.extend({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

function AuthForm({ onSuccess }) {
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuthStore()

  const schema = isLogin ? loginSchema : registerSchema
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    setLoading(true)
    try {
      if (isLogin) {
        await signIn(data.email, data.password)
        toast.success('Welcome back!')
      } else {
        await signUp(data.email, data.password, data.username)
        toast.success('Account created! Please check your email to verify.')
      }
      onSuccess?.()
    } catch (error) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    reset()
  }

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {!isLogin && (
          <div>
            <label className="label">Username</label>
            <input
              {...register('username')}
              type="text"
              className="input"
              placeholder="Enter username"
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
            )}
          </div>
        )}

        <div>
          <label className="label">Email</label>
          <input
            {...register('email')}
            type="email"
            className="input"
            placeholder="Enter email"
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="label">Password</label>
          <input
            {...register('password')}
            type="password"
            className="input"
            placeholder="Enter password"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        {!isLogin && (
          <div>
            <label className="label">Confirm Password</label>
            <input
              {...register('confirmPassword')}
              type="password"
              className="input"
              placeholder="Confirm password"
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">{errors.confirmPassword.message}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={toggleMode}
          className="text-soda-red hover:underline text-sm"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>

      {isLogin && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Demo Credentials:</p>
          <p>Email: admin@soda.shop</p>
          <p>Password: admin123</p>
        </div>
      )}
    </div>
  )
}

export default AuthForm
