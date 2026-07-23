import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

/** Legacy form — hidden; no longer used. */
export default function FacebookPage() {
  redirect('/')
}
