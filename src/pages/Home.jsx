import { ParticleTextEffect } from "../components/ui/particle-text-effect"

const MECHE_WORDS = ["MechE-SA", "IIT INDORE", "INNOVATE", "ENGINEER", "INSPIRE"]

const Home = () => {
  return (
    /* Outer: full viewport, no scroll */
    <div className="fixed inset-0 bg-black overflow-hidden">

      {/* Canvas fills 100vw × 100vh as the background */}
      <ParticleTextEffect words={MECHE_WORDS} />

      {/* Overlay UI — sits on top of the canvas, pointer-events disabled
          on the wrapper so clicks still reach the canvas */}
      <div
        className="absolute inset-0 flex flex-col items-center justify-end pb-16 pointer-events-none"
      >
        {/* Tagline */}
        <p className="text-gray-400 text-sm sm:text-base tracking-widest uppercase mb-1">
          Mechanical Engineering Students&apos; Association
        </p>
        <p className="text-gray-600 text-xs tracking-widest mb-8">
          IIT Indore
        </p>

        {/* CTA buttons — re-enable pointer events just for buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 pointer-events-auto">
          <a
            href="/events"
            className="px-8 py-3 rounded-full text-sm font-semibold text-black bg-sky-400 hover:bg-sky-300 transition-colors duration-200"
          >
            Explore Events
          </a>
          <a
            href="/team"
            className="px-8 py-3 rounded-full text-sm font-semibold text-sky-400 border border-sky-400/50 hover:border-sky-300 hover:text-sky-300 transition-colors duration-200"
          >
            Meet the Team
          </a>
        </div>

        {/* Hint */}
        <p className="mt-6 text-gray-700 text-xs tracking-wider">
          Click &amp; drag on the text to scatter particles
        </p>
      </div>
    </div>
  )
}

export default Home
