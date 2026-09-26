'use server'

import { db } from '@/db'
import { channels } from '@/db/schema'
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

const ChannelSchema = z.object({
  category_id: z.string().min(1, 'Category is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').nullable().optional(),
  poster_url: z.string().url('Invalid poster URL').nullable().optional().or(z.literal('')),
  banner_url: z.string().url('Invalid banner URL').nullable().optional().or(z.literal('')),
  source_url: z.string().url('Invalid source URL').or(z.literal('')),
  is_active: z.boolean(),
  is_streaming: z.boolean(),
  quality: z.string().max(50).nullable().optional(),
})

const UpdateChannelSchema = ChannelSchema.extend({
  id: z.string().min(1, 'Channel ID is required'),
})

const DeleteChannelSchema = z.object({
  id: z.string().min(1, 'Channel ID is required'),
})

export async function createChannel(formData: FormData) {
  const validatedFields = ChannelSchema.safeParse({
    category_id: formData.get('category_id') || '',
    title: formData.get('title') || '',
    description: formData.get('description') || '',
    poster_url: formData.get('poster_url') || '',
    banner_url: formData.get('banner_url') || '',
    source_url: formData.get('source_url') || '',
    is_active: formData.get('is_active') === 'true',
    is_streaming: formData.get('is_streaming') === 'true',
    quality: formData.get('quality') || '',
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  try {
    const user = await getAuthenticatedUser()

    await db.insert(channels).values({
      user_id: user.id,
      category_id: validatedFields.data.category_id,
      title: validatedFields.data.title,
      description: validatedFields.data.description,
      poster_url: validatedFields.data.poster_url,
      banner_url: validatedFields.data.banner_url,
      source_url: validatedFields.data.source_url,
      is_active: validatedFields.data.is_active,
      is_streaming: validatedFields.data.is_streaming,
      quality: validatedFields.data.quality || 'HD',
    })

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error creating channel' }
  }
}

export async function updateChannel(formData: FormData) {
  const validatedFields = UpdateChannelSchema.safeParse({
    id: formData.get('id') || '',
    category_id: formData.get('category_id') || '',
    title: formData.get('title') || '',
    description: formData.get('description') || '',
    poster_url: formData.get('poster_url') || '',
    banner_url: formData.get('banner_url') || '',
    source_url: formData.get('source_url') || '',
    is_active: formData.get('is_active') === 'true',
    is_streaming: formData.get('is_streaming') === 'true',
    quality: formData.get('quality') || '',
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  const { id, ...updateData } = validatedFields.data

  try {
    const user = await getAuthenticatedUser()

    await db
      .update(channels)
      .set({
        category_id: updateData.category_id,
        title: updateData.title,
        description: updateData.description,
        poster_url: updateData.poster_url,
        banner_url: updateData.banner_url,
        source_url: updateData.source_url,
        is_active: updateData.is_active,
        is_streaming: updateData.is_streaming,
        quality: updateData.quality || 'HD',
      })
      .where(and(eq(channels.id, id), eq(channels.user_id, user.id)))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error updating channel' }
  }
}

export async function deleteChannel(formData: FormData) {
  const validatedFields = DeleteChannelSchema.safeParse({
    id: formData.get('id') || '',
  })

  if (!validatedFields.success) {
    return { error: validatedFields.error.issues[0].message }
  }

  try {
    const user = await getAuthenticatedUser()

    await db
      .delete(channels)
      .where(and(eq(channels.id, validatedFields.data.id), eq(channels.user_id, user.id)))

    revalidatePath('/dashboard')
    return { success: true }
  } catch (error: any) {
    return { error: error.message || 'Error deleting channel' }
  }
}
