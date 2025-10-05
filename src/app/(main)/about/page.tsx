"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import ShinyText from "@/components/ShinyText";
import SplashCursor from "@/components/effects/SplashCursor";
import Particles from "@/components/effects/Particles";
import { 
  Rocket, 
  Target, 
  Users, 
  TrendingUp, 
  Sparkles, 
  Gamepad2,
  UserPlus,
  Upload,
  ThumbsUp,
  MessageSquare,
  Trophy,
  Zap
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background relative">
      {/* Particles Background - Same as Landing Page Hero */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={['#8B5CF6', '#A78BFA', '#C4B5FD']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>
      
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background/80 z-0 pointer-events-none" />
      
      {/* Splash Cursor Effect */}
      <SplashCursor />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center space-y-6 animate-fade-in">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image 
                src="/logo/mgh.png" 
                alt="Mobile Game Hunt Logo" 
                width={120}
                height={120}
                className="object-contain animate-fade-in"
                style={{
                  filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.6))',
                }}
              />
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              <span className="inline-flex flex-wrap justify-center gap-x-3 gap-y-2">
                <span className="text-white transition-all duration-500 hover:scale-105 inline-block animate-fade-in opacity-0 [animation-fill-mode:forwards]">
                  <span className="text-orange-500 font-extrabold text-shadow-[0_0_20px_rgba(255,107,53,0.8)] hover:text-shadow-[0_0_30px_rgba(255,107,53,1)] transition-all duration-300 hover:scale-110 inline-block" style={{textShadow: '0 0 20px rgba(255, 107, 53, 0.8)'}}>M</span>obile
                </span>
                <span className="text-white transition-all duration-500 hover:scale-105 inline-block animate-fade-in opacity-0 [animation-delay:200ms] [animation-fill-mode:forwards]">
                  <span className="text-orange-500 font-extrabold hover:scale-110 inline-block transition-all duration-300" style={{textShadow: '0 0 20px rgba(255, 107, 53, 0.8)'}}>G</span>ame
                </span>
                <span className="text-white transition-all duration-500 hover:scale-105 inline-block animate-fade-in opacity-0 [animation-delay:400ms] [animation-fill-mode:forwards]">
                  <span className="text-orange-500 font-extrabold hover:scale-110 inline-block transition-all duration-300" style={{textShadow: '0 0 20px rgba(255, 107, 53, 0.8)'}}>H</span>unt
                </span>
              </span>
            </h1>
            <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Built by gamers for gamers and developers, this platform lets you{' '}
              <span className="relative inline-block">
                <span className="relative z-10 bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent font-semibold">
                  discover
                </span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-cyan-400/20 to-blue-500/20 rounded-lg blur-sm -z-10"></span>
                <span className="absolute inset-0 bg-gradient-to-r from-blue-400/10 via-cyan-400/10 to-blue-500/10 rounded-lg animate-pulse -z-20"></span>
              </span>
              , showcase and celebrate the{' '}
              <span className="relative inline-block">
                <span className="relative z-10 text-white font-semibold">
                  best mobile games
                </span>
                <span className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-yellow-400 to-orange-500 rounded-full animate-pulse"></span>
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-300 via-yellow-300 to-orange-400 rounded-full opacity-60"></span>
              </span>
              .
            </p>
          </div>
        </div>
      </section>

      {/* Scattered Asymmetric Content Layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 space-y-16 md:space-y-24 relative z-10">
        
        {/* Purpose Section - Left Aligned */}
        <div className="grid md:grid-cols-12 gap-8 items-center animate-fade-in [animation-delay:200ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="md:col-span-7 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 backdrop-blur-sm border border-purple-500/20">
                <Rocket className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                <ShinyText>Why We Built This</ShinyText>
              </h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed">
              The mobile gaming industry is vast, but discovering quality indie games 
              and hidden gems is challenging. We created Mobile Game Hunt to bridge 
              the gap between talented developers and passionate players.
            </p>
            <p className="text-lg text-gray-300 leading-relaxed">
              Too many amazing games go unnoticed while players struggle to find 
              their next favorite title. We&apos;re changing that by creating a 
              community-driven platform where quality rises to the top.
            </p>
          </div>
          <div className="md:col-span-5">
            <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 via-purple-500/10 to-transparent border border-purple-500/30 p-8 shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:shadow-[0_0_40px_rgba(168,85,247,0.5)] transition-all duration-300 transform hover:scale-105">
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-purple-400">
                  <ShinyText>100+</ShinyText>
                </div>
                <p className="text-gray-300">Curated Games</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mission & Vision - Right Aligned with Offset */}
        <div className="grid md:grid-cols-12 gap-8 items-center animate-fade-in [animation-delay:400ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="md:col-span-5 md:col-start-2 order-2 md:order-1">
            <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 via-purple-500/5 to-transparent border border-purple-500/30 p-8 shadow-[0_0_25px_rgba(168,85,247,0.25)] space-y-6">
              <div className="space-y-3">
                <Target className="h-8 w-8 text-purple-400" />
                <h3 className="text-2xl font-bold">Our Mission</h3>
                <p className="text-gray-300">
                  Empower indie developers and help players discover games 
                  they&apos;ll love through authentic community engagement.
                </p>
              </div>
              <div className="space-y-3">
                <Sparkles className="h-8 w-8 text-purple-400" />
                <h3 className="text-2xl font-bold">Our Vision</h3>
                <p className="text-gray-300">
                  Build the most trusted and vibrant mobile gaming discovery 
                  platform where quality content thrives.
                </p>
              </div>
            </div>
          </div>
          <div className="md:col-span-6 order-1 md:order-2 space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 backdrop-blur-sm border border-purple-500/20">
                <Target className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                <ShinyText>Our Mission & Vision</ShinyText>
              </h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed">
              We solve the discovery problem by combining community voting, 
              engagement metrics, and editorial curation to surface the best games.
            </p>
            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="rounded-xl bg-gray-900/40 border border-purple-500/20 p-4 space-y-2 hover:bg-gray-900/60 hover:border-purple-500/30 transition-all duration-300">
                <Users className="h-6 w-6 text-purple-400" />
                <h4 className="font-semibold">Community First</h4>
                <p className="text-sm text-gray-400">Players decide what&apos;s great</p>
              </div>
              <div className="rounded-xl bg-gray-900/40 border border-purple-500/20 p-4 space-y-2 hover:bg-gray-900/60 hover:border-purple-500/30 transition-all duration-300">
                <TrendingUp className="h-6 w-6 text-purple-400" />
                <h4 className="font-semibold">Fair Rankings</h4>
                <p className="text-sm text-gray-400">Merit-based visibility</p>
              </div>
            </div>
          </div>
        </div>

        {/* How to Use - Full Width Cards */}
        <div className="space-y-8 animate-fade-in [animation-delay:600ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <ShinyText>How to Use the Platform</ShinyText>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Getting started is simple. Follow these steps to join our community.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="rounded-2xl bg-gray-900/80 border border-purple-500/20 p-6 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:-translate-y-2 group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                    <UserPlus className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-4xl font-bold text-purple-500/20">01</span>
                </div>
                <h3 className="text-xl font-bold">Sign Up</h3>
                <p className="text-gray-400">
                  Create your free account in seconds and join the community.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="rounded-2xl bg-gray-900/80 border border-purple-500/20 p-6 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:-translate-y-2 group [animation-delay:100ms]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                    <Upload className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-4xl font-bold text-purple-500/20">02</span>
                </div>
                <h3 className="text-xl font-bold">Submit Games</h3>
                <p className="text-gray-400">
                  Share your game or discover new ones submitted by developers.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="rounded-2xl bg-gray-900/80 border border-purple-500/20 p-6 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:-translate-y-2 group [animation-delay:200ms]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                    <ThumbsUp className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-4xl font-bold text-purple-500/20">03</span>
                </div>
                <h3 className="text-xl font-bold">Vote & Engage</h3>
                <p className="text-gray-400">
                  Upvote favorites, comment, and help quality games rise.
                </p>
              </div>
            </div>

            {/* Step 4 */}
            <div className="rounded-2xl bg-gray-900/80 border border-purple-500/20 p-6 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] transition-all duration-300 transform hover:-translate-y-2 group [animation-delay:300ms]">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors border border-purple-500/20">
                    <MessageSquare className="h-6 w-6 text-purple-400" />
                  </div>
                  <span className="text-4xl font-bold text-purple-500/20">04</span>
                </div>
                <h3 className="text-xl font-bold">Build Community</h3>
                <p className="text-gray-400">
                  Connect with developers and fellow gamers who share your passion.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* XP System - Staggered Layout */}
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 animate-fade-in [animation-delay:800ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 backdrop-blur-sm border border-purple-500/20">
                <Trophy className="h-6 w-6 text-purple-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold">
                <ShinyText>Gain Experience & Visibility</ShinyText>
              </h2>
            </div>
            <p className="text-lg text-gray-300 leading-relaxed">
              Our unique XP system rewards active community members and helps 
              quality contributions gain visibility naturally.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mt-1">
                  <ThumbsUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Community Voting</h4>
                  <p className="text-sm text-gray-400">
                    Every upvote earns you XP and boosts your game&apos;s ranking.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mt-1">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Engagement Metrics</h4>
                  <p className="text-sm text-gray-400">
                    Comments, discussions, and feedback contribute to visibility.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 mt-1">
                  <TrendingUp className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1">Dynamic Rankings</h4>
                  <p className="text-sm text-gray-400">
                    Real-time leaderboards showcase top games and contributors.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-500/5 border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(168,85,247,0.25)] space-y-3">
              <Zap className="h-8 w-8 text-purple-400" />
              <div className="text-3xl font-bold">
                <ShinyText>Level Up</ShinyText>
              </div>
              <p className="text-sm text-gray-400">
                Unlock badges and perks as you contribute
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-500/5 border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(168,85,247,0.25)] space-y-3 mt-8">
              <Trophy className="h-8 w-8 text-purple-400" />
              <div className="text-3xl font-bold">
                <ShinyText>Earn Badges</ShinyText>
              </div>
              <p className="text-sm text-gray-400">
                Show off your achievements and expertise
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-500/5 border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(168,85,247,0.25)] space-y-3 -mt-4">
              <Sparkles className="h-8 w-8 text-purple-400" />
              <div className="text-3xl font-bold">
                <ShinyText>Get Featured</ShinyText>
              </div>
              <p className="text-sm text-gray-400">
                Top contributors get homepage placement
              </p>
            </div>
            <div className="rounded-2xl bg-gradient-to-br from-purple-600/20 to-purple-500/5 border border-purple-500/30 p-6 shadow-[0_0_20px_rgba(168,85,247,0.25)] space-y-3 mt-4">
              <Users className="h-8 w-8 text-purple-400" />
              <div className="text-3xl font-bold">
                <ShinyText>Build Trust</ShinyText>
              </div>
              <p className="text-sm text-gray-400">
                Your reputation grows with quality input
              </p>
            </div>
          </div>
        </div>

        {/* Stand Out Section - Centered Card */}
        <div className="max-w-4xl mx-auto animate-fade-in [animation-delay:1000ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-900/60 to-purple-900/20 border border-purple-500/30 p-8 md:p-12 shadow-[0_0_40px_rgba(168,85,247,0.3)]">
            <div className="text-center space-y-6">
              <div className="inline-flex p-4 rounded-2xl bg-purple-500/10 backdrop-blur-sm border border-purple-500/20">
                <Sparkles className="h-10 w-10 text-purple-400" />
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
                <ShinyText>How to Stand Out</ShinyText>
              </h2>
              <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed">
                Make your game shine with these proven strategies from successful developers on our platform.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-6 pt-6 text-left">
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">📸 High-Quality Media</h4>
                  <p className="text-sm text-gray-400">
                    Use stunning screenshots and engaging gameplay videos.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">✍️ Compelling Description</h4>
                  <p className="text-sm text-gray-400">
                    Tell your game&apos;s story and highlight unique features.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">💬 Engage with Community</h4>
                  <p className="text-sm text-gray-400">
                    Respond to comments and build relationships with players.
                  </p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold text-lg">🔄 Regular Updates</h4>
                  <p className="text-sm text-gray-400">
                    Keep your game page fresh with news and improvements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-8 pt-12 animate-fade-in [animation-delay:1200ms] opacity-0 [animation-fill-mode:forwards]">
          <div className="space-y-4">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <Image 
                src="/logo/mgh.png" 
                alt="Mobile Game Hunt Logo" 
                width={100}
                height={100}
                className="object-contain"
                style={{
                  filter: 'drop-shadow(0 0 25px rgba(139, 92, 246, 0.6))',
                }}
              />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
              <ShinyText>Ready to Get Started?</ShinyText>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Join thousands of developers and gamers discovering amazing mobile games every day.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Link href="/">
              <Button
                size="lg"
                className="group relative overflow-hidden rounded-2xl bg-purple-600 hover:bg-purple-700 px-8 py-6 text-base sm:text-lg font-semibold shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_40px_rgba(168,85,247,0.6)] hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <Gamepad2 className="mr-2 h-5 w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                Start Discovering Games
              </Button>
            </Link>

            <Link href="/submit">
              <Button
                size="lg"
                variant="outline"
                className="group relative overflow-hidden rounded-2xl border-2 border-purple-500/70 bg-purple-500/10 backdrop-blur-sm px-8 py-6 text-base sm:text-lg font-semibold text-purple-300 hover:text-white hover:bg-purple-500/20 hover:border-purple-400 shadow-[0_0_20px_rgba(168,85,247,0.2)] hover:shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                <Upload className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                Submit Your Game
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="pt-12 flex flex-wrap justify-center gap-8 md:gap-12 text-center">
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-400">
                <ShinyText>1K+</ShinyText>
              </div>
              <p className="text-sm text-gray-400">Community Members</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-400">
                <ShinyText>100+</ShinyText>
              </div>
              <p className="text-sm text-gray-400">Curated Games</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-400">
                <ShinyText>250+</ShinyText>
              </div>
              <p className="text-sm text-gray-400">User Reviews</p>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-bold text-purple-400">
                <ShinyText>50+</ShinyText>
              </div>
              <p className="text-sm text-gray-400">Daily Submissions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

