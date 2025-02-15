'use client';

import Link from "next/link"
import Image from "next/image"
import { Trophy, Users, BookOpen } from 'lucide-react'
import { ConnectButton } from "@rainbow-me/rainbowkit"
import type React from "react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[#26163E] border-b border-purple-700/20">
      <div className="lg:px-[10vw] flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <Image src="/logo-white.png" alt="REKT Logo" width={120} height={32} className="h-8 w-auto" priority />
          </Link>
        </div>
        <nav className="flex items-center space-x-6">
          <Link 
            href="/home" 
            className="flex items-center text-purple-200/80 hover:text-purple-100 transition-colors"
          >
            <Trophy className="h-4 w-4 mr-2" />
            <span className="text-sm">Tournaments</span>
          </Link>
          {/* <Link 
            href="/leaderboard" 
            className="flex items-center text-purple-200/80 hover:text-purple-100 transition-colors"
          >
            <Users className="h-4 w-4 mr-2" />
            <span className="text-sm">Leaderboard</span>
          </Link> */}
          <a 
            href="https://github.com/rekt-ai"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-purple-200/80 hover:text-purple-100 transition-colors"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            <span className="text-sm">Documentation</span>
          </a>
          <div className="ml-6">
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
                const ready = mounted
                const connected = ready && account && chain

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="flex items-center px-4 py-2 rounded-lg bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                          >
                            <span className="text-sm">Arbitrum Sepolia</span>
                          </button>
                        )
                      }

                      if (chain.unsupported) {
                        return (
                          <button 
                            onClick={openChainModal}
                            className="flex items-center px-4 py-2 rounded-lg bg-red-500/10 text-red-200 hover:bg-red-500/20 transition-colors"
                          >
                            Wrong network
                          </button>
                        )
                      }

                      return (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={openChainModal}
                            className="flex items-center px-4 py-2 rounded-lg bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                          >
                            {chain.hasIcon && (
                              <div
                                style={{
                                  background: chain.iconBackground,
                                  width: 12,
                                  height: 12,
                                  borderRadius: 999,
                                  overflow: "hidden",
                                  marginRight: 4,
                                }}
                              >
                                {chain.iconUrl && (
                                  <Image
                                    alt={chain.name ?? "Chain icon"}
                                    src={chain.iconUrl || "/placeholder.svg"}
                                    width={12}
                                    height={12}
                                  />
                                )}
                              </div>
                            )}
                            <span className="text-sm">{chain.name}</span>
                          </button>

                          <button
                            onClick={openAccountModal}
                            className="flex items-center px-4 py-2 rounded-lg bg-purple-500/10 text-purple-200 hover:bg-purple-500/20 transition-colors"
                          >
                            <span className="text-sm">
                              {account.displayName}
                              {account.displayBalance ? ` (${account.displayBalance})` : ""}
                            </span>
                          </button>
                        </div>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
          </div>
        </nav>
      </div>
    </header>
  )
}