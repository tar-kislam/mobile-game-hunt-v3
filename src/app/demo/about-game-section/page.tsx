"use client"

import { AboutGameSection } from '@/components/product/about-game-section'

const sampleDescription = `
Welcome to the ultimate mobile gaming experience! This revolutionary game combines the best elements of strategy, action, and adventure to create an unforgettable journey that will keep you engaged for hours on end.

In this epic adventure, you'll embark on a quest to save the mystical realm of Eldoria from the dark forces that threaten to destroy everything you hold dear. As the chosen hero, you'll wield powerful magic, battle fierce creatures, and forge alliances with legendary warriors.

The game features a unique combat system that combines real-time strategy with tactical decision-making. Every battle is different, requiring you to adapt your strategy based on your enemies' strengths and weaknesses. Master the art of spell-casting, learn to command armies, and discover the secrets of ancient artifacts that hold unimaginable power.

Explore a vast open world filled with hidden treasures, mysterious dungeons, and breathtaking landscapes. From the snow-capped mountains of the Northern Kingdoms to the lush forests of the Eastern Territories, every location tells its own story and offers unique challenges.

Build and customize your character with hundreds of different weapons, armor pieces, and magical items. Each piece of equipment affects your abilities and playstyle, allowing for deep character customization that reflects your personal preferences.

Join forces with other players in massive multiplayer battles where teamwork and strategy are the keys to victory. Form guilds, participate in epic raids, and compete in tournaments for glory and legendary rewards.

The game's stunning graphics and immersive sound design create a truly cinematic experience. Every spell cast, every sword swing, and every explosion is rendered with incredible detail that brings the world of Eldoria to life.

Regular updates bring new content, including new areas to explore, new monsters to battle, and new challenges to overcome. The developers are constantly working to improve the game based on community feedback, ensuring that your experience gets better with every update.

Whether you're a casual player looking for a quick adventure or a hardcore gamer seeking the ultimate challenge, this game offers something for everyone. The intuitive controls make it easy to pick up and play, while the deep mechanics provide endless depth for those who want to master every aspect of the game.

Download now and begin your legendary journey in the world of Eldoria. The fate of the realm rests in your hands!
`.trim()

export default function AboutGameSectionDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[#121225] to-[#050509] p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">About Game Section Demo</h1>
          <p className="text-gray-400">
            Experience the new expandable "About This Game" section with smooth animations
          </p>
        </div>

        {/* Demo Section */}
        <AboutGameSection description={sampleDescription} />

        {/* Features List */}
        <div className="mt-12 p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50">
          <h2 className="text-2xl font-bold text-white mb-4">Features</h2>
          <ul className="space-y-3 text-gray-300">
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Shows first 600 words by default with fade gradient</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Smooth expand/collapse animations with Framer Motion</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Auto-scroll to section when expanding</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Purple glow button with hover effects</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Full accessibility support (ARIA, keyboard navigation)</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Responsive design for all screen sizes</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
              <span>Matches Mobile Game Hunt's dark futuristic theme</span>
            </li>
          </ul>
        </div>

        {/* Usage Example */}
        <div className="mt-8 p-6 bg-gray-900/50 rounded-2xl border border-gray-800/50">
          <h2 className="text-2xl font-bold text-white mb-4">Usage</h2>
          <div className="bg-black/50 rounded-lg p-4">
            <pre className="text-green-400 text-sm overflow-x-auto">
{`import { AboutGameSection } from '@/components/product/about-game-section'

<AboutGameSection description={product.description} />`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
