'use server'

import { db } from '@/db'
import { categories, externalSettings, externalChannels } from '@/db/schema'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { eq, and } from 'drizzle-orm'

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })
  if (!session?.user) {
    throw new Error('Not authenticated')
  }
  return session.user
}

const CategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
  description: z.string().max(500, 'Description is too long').nullable().optional(),
})

const UpdateCategorySchema = CategorySchema.extend({
  id: z.string().min(1, 'Category ID is required'),
})

const DeleteCategorySchema = z.object({
  id: z.string().min(1, 'Category ID is required'),
})

export async function createCategory(formData: FormData) {
  const validatedFields = CategorySchema.safeParse({
    name: formData.get('name') || '',
    description: formData.get('description') || '',
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  try {
    const user = await getAuthenticatedUser()

    await db.insert(categories).values({
      user_id: user.id,
      name: validatedFields.data.name,
      description: validatedFields.data.description,
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error creating category' }
  }
}

export async function updateCategory(formData: FormData) {
  const validatedFields = UpdateCategorySchema.safeParse({
    id: formData.get('id') || '',
    name: formData.get('name') || '',
    description: formData.get('description') || '',
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { id, ...updateData } = validatedFields.data

  try {
    const user = await getAuthenticatedUser()

    await db
      .update(categories)
      .set(updateData)
      .where(and(eq(categories.id, id), eq(categories.user_id, user.id)))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error updating category' }
  }
}

export async function deleteCategory(formData: FormData) {
  const validatedFields = DeleteCategorySchema.safeParse({
    id: formData.get('id') || '',
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  try {
    const user = await getAuthenticatedUser()

    await db
      .delete(categories)
      .where(and(eq(categories.id, validatedFields.data.id), eq(categories.user_id, user.id)))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error deleting category' }
  }
}

// --- External Sources Actions ---

export async function updateExternalSettings(formData: FormData) {
  const key = formData.get('key') as string
  const valueRaw = formData.get('value') as string

  let value: unknown
  try {
    value = JSON.parse(valueRaw)
  } catch {
    value = valueRaw.split(',').map((v) => v.trim()).filter(Boolean)
  }

  try {
    const user = await getAuthenticatedUser()

    await db
      .insert(externalSettings)
      .values({
        user_id: user.id,
        key,
        value,
      })
      .onConflictDoUpdate({
        target: [externalSettings.user_id, externalSettings.key],
        set: { value },
      })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error updating external settings' }
  }
}

export async function addExternalChannel(channel: { external_id: string; name: string }) {
  try {
    const user = await getAuthenticatedUser()

    await db
      .insert(externalChannels)
      .values({
        user_id: user.id,
        external_id: channel.external_id,
        name: channel.name,
        is_active: true,
      })
      .onConflictDoUpdate({
        target: [externalChannels.user_id, externalChannels.external_id],
        set: { name: channel.name, is_active: true },
      })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error adding external channel' }
  }
}

export async function removeExternalChannel(externalId: string) {
  try {
    const user = await getAuthenticatedUser()

    await db
      .delete(externalChannels)
      .where(and(eq(externalChannels.user_id, user.id), eq(externalChannels.external_id, externalId)))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error removing external channel' }
  }
}
