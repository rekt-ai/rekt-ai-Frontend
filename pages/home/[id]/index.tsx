"use client"
import { useRouter } from 'next/router'
import MarketEntry from '@/components/market-entry/market-entry'

export default function MarketPage() {
  const router = useRouter()
  const { id } = router.query

  return <MarketEntry marketId={Number(id)} />
}