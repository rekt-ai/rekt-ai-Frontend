import { type AppProps } from 'next/app'
import { ThemeProvider } from 'next-themes'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RainbowKitProvider, darkTheme, type Chain } from '@rainbow-me/rainbowkit'
import { arbitrumSepolia } from 'wagmi/chains'
import '@rainbow-me/rainbowkit/styles.css'

import { wagmiConfig } from '@/configs/wagmi'
// import Header from '@/components/header/header'
import Footer from '@/components/footer/footer'
import '../styles/globals.css'
import { Header } from '@/components/header/header'

const localChain: Chain = {
  id: 1337,
  name: 'Ganache',
  nativeCurrency: {
    decimals: 18,
    name: 'Ganache Ether',
    symbol: 'ETH'
  },
  rpcUrls: {
    default: {
      http: ['https://ganache.renakaagusta.dev']
    },
    public: {
      http: ['https://ganache.renakaagusta.dev']
    }
  },
  blockExplorers: {
    default: {
      name: 'Ganache Explorer',
      url: 'https://ganache.renakaagusta.dev'
    }
  },
  testnet: true
}

const queryClient = new QueryClient()

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={arbitrumSepolia}
          theme={darkTheme({
            accentColor: 'white',
            accentColorForeground: 'black'
          })}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            value={{ light: 'light', dark: 'dark' }}
            disableTransitionOnChange
          >
            {/* <div className='relative flex min-h-screen flex-col'> */}
              <Header />
              <Component {...pageProps} />
              {/* <Footer /> */}
            {/* </div> */}
          </ThemeProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}