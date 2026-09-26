import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { desc, eq, asc } from 'drizzle-orm'
import { auth } from '@/lib/auth'
import { db } from '@/db'
import {
  categories as categoriesTable,
  channels as channelsTable,
  externalSettings as externalSettingsTable,
  externalChannels as externalChannelsTable,
} from '@/db/schema'
import { signout } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { DashboardSidebarLayout } from '@/components/dashboard/dashboard-layout-client'

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect('/login')
  }

  const user = session.user

  const [categories, channels, externalSettings, whitelistedChannels] = await Promise.all([
    db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.user_id, user.id))
      .orderBy(desc(categoriesTable.created_at)),
    db
      .select()
      .from(channelsTable)
      .where(eq(channelsTable.user_id, user.id))
      .orderBy(desc(channelsTable.created_at)),
    db
      .select()
      .from(externalSettingsTable)
      .where(eq(externalSettingsTable.user_id, user.id)),
    db
      .select()
      .from(externalChannelsTable)
      .where(eq(externalChannelsTable.user_id, user.id))
      .orderBy(asc(externalChannelsTable.name)),
  ])

  return (
    <div className="flex min-h-screen w-full flex-col p-4 sm:p-8 bg-neutral-50 dark:bg-neutral-950">
      <header className="flex flex-col sm:flex-row items-center justify-between pb-4 mb-4 sm:mb-8 gap-4 w-full max-w-7xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 dark:text-neutral-50">Dashboard</h1>
        <form action={signout}>
          <Button
            type="submit"
            className="bg-red-500 hover:bg-red-600 text-white dark:bg-red-600 dark:hover:bg-red-700 w-full sm:w-auto hover:cursor-pointer h-9 px-4 text-sm font-medium"
          >
            Sign out
          </Button>
        </form>
      </header>

      <DashboardSidebarLayout
        user={user}
        categories={categories}
        channels={channels}
        externalSettings={externalSettings}
        whitelistedChannels={whitelistedChannels}
      />
    </div>
  )
}
