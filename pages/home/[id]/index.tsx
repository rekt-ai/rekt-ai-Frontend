"use client"
import { useRouter } from 'next/router'
import TournamentEntry from '@/components/tournament-entry/tournament-entry'

export default function TournamentPage() {
  const router = useRouter()
  const { id } = router.query

  return <TournamentEntry tournamentId={id as string} />
}