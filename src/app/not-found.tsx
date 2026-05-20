import Link from "next/link"
import { motion } from "framer-motion"

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="relative">
        <div className="absolute inset-0 bg-electric-500/20 blur-[100px] rounded-full"></div>
        <h1 className="text-9xl font-black text-transparent bg-clip-text bg-gradient-to-br from-electric-400 to-violet-600 mb-4 relative z-10">
          404
        </h1>
      </div>
      
      <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
        Page Not Found
      </h2>
      
      <p className="text-[var(--text-secondary)] mb-8 max-w-md">
        Oops! The page you are looking for seems to have drifted into another dimension. Let's get you back on track.
      </p>

      <Link 
        href="/"
        className="px-8 py-4 bg-gradient-to-r from-electric-500 to-violet-600 text-white font-bold rounded-2xl hover:opacity-90 transition-opacity shadow-lg shadow-electric-500/25"
      >
        Return Home
      </Link>
    </div>
  )
}
