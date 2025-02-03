"use client"

import { WagmiProvider } from "wagmi"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit"
import { ThemeProvider } from "next-themes"
import { arbitrumSepolia } from "wagmi/chains"
import { wagmiConfig } from "@/configs/wagmi"
import type { ReactNode } from "react"

const queryClient = new QueryClient()

export function Providers({ children }: { children: ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={arbitrumSepolia}
          theme={darkTheme({
            accentColor: "#c17f59",
            accentColorForeground: "black",
          })}
        >
          <ThemeProvider attribute="class" defaultTheme="dark" disableTransitionOnChange>
            {children}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}

