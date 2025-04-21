import dynamic from 'next/dynamic'

const LandingPage = dynamic(
  () => import('@/components/landing/landing-page').then((mod) => mod.LandingPage),
  { ssr: false }
)

export default function Home() {
  return <LandingPage />
}

