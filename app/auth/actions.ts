'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { auth } from '@/lib/auth'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  let redirectUrl: string | null = null

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    })
  } catch (error: any) {
    redirectUrl = '/login?error=' + encodeURIComponent(error?.message || 'Invalid credentials')
  }

  if (redirectUrl) {
    redirect(redirectUrl)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string

  if (password !== confirmPassword) {
    redirect('/register?error=' + encodeURIComponent('The passwords do not match'))
  }

  let redirectUrl: string | null = null

  try {
    const name = email.split('@')[0]
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    })
  } catch (error: any) {
    redirectUrl = '/register?error=' + encodeURIComponent(error?.message || 'Registration failed')
  }

  if (redirectUrl) {
    redirect(redirectUrl)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signout() {
  try {
    await auth.api.signOut({
      headers: await headers(),
    })
  } catch (error) {
    console.error('Sign out error:', error)
  }

  revalidatePath('/', 'layout')
  redirect('/login')
}

export async function resetPasswordEmail(formData: FormData) {
  const email = formData.get('email') as string

  let redirectUrl: string | null = null
  try {
    await auth.api.requestPasswordReset({
      body: {
        email,
        redirectTo: '/update-password',
      },
      headers: await headers(),
    })
    redirectUrl = '/forgot-password?message=' + encodeURIComponent('If the email exists, instructions have been sent.')
  } catch (error: any) {
    redirectUrl = '/forgot-password?error=' + encodeURIComponent(error?.message || 'Error requesting password reset')
  }

  redirect(redirectUrl)
}

export async function updatePasswordAction(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirm_password') as string
  const token = (formData.get('token') as string) || undefined

  if (password !== confirmPassword) {
    redirect('/update-password?error=' + encodeURIComponent('The passwords do not match') + (token ? `&token=${token}` : ''))
  }

  let redirectUrl: string | null = null
  try {
    await auth.api.resetPassword({
      body: {
        newPassword: password,
        token,
      },
      headers: await headers(),
    })
    redirectUrl = '/login?message=' + encodeURIComponent('Password updated successfully. Please log in.')
  } catch (error: any) {
    redirectUrl = '/update-password?error=' + encodeURIComponent(error?.message || 'Error updating password') + (token ? `&token=${token}` : '')
  }

  redirect(redirectUrl)
}
