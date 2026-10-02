import { requireCurrentProfile } from "@/lib/current-profile"
import { ProfileForm } from "./profile-form"

export default async function ProfilePage() {
  const { profile } = await requireCurrentProfile()

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">Profile</h1>
      <ProfileForm profile={profile} />
    </div>
  )
}
