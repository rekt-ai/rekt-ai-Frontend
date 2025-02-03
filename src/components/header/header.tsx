import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Trophy, Users, BookOpen } from "lucide-react"
import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-light/10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="lg:px-[10vw] flex h-16 items-center">
        <div className="mr-8">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/rekt-logo.png"
              alt="REKT-AI Logo"
              width={120}
              height={32}
              className="h-8 w-auto"
              priority
            />
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-1">
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-slate-light">
              <Link href="/tournaments" className="font-mono">
                <Trophy className="h-4 w-4 mr-2" />
                Tournaments
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-slate-light">
              <Link href="/leaderboard" className="font-mono">
                <Users className="h-4 w-4 mr-2" />
                Leaderboard
              </Link>
            </Button>
            <Button variant="ghost" asChild className="text-muted-foreground hover:text-slate-light">
              <Link href="/learn" className="font-mono">
                <BookOpen className="h-4 w-4 mr-2" />
                Learn
              </Link>
            </Button>
          </nav>
          <div className="flex items-center space-x-2">
            {/* <Button
              variant="outline"
              className="relative overflow-hidden font-mono border-slate-light/20 text-slate-light transition-all duration-300 hover:border-slate-light/40 hover:bg-slate-light/5"
            >
              <div className="absolute inset-0 bg-blockchain-grid opacity-5"></div>
              Connect Wallet
            </Button> */}

            <ConnectButton />
          </div>
        </div>
      </div>
    </header>
  )
}

