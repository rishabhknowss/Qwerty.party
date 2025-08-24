"use client"

import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, Users, Trophy, Play, Gamepad2, MessageSquare, Crown, Star, Github, Heart } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

export default function Home() {
  const [timer, setTimer] = useState(6)
  const [typingText, setTypingText] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => (prev === 1 ? 6 : prev - 1))
    }, 1000)

    return () => clearInterval(timerInterval)
  }, [])

  useEffect(() => {
    const typingInterval = setInterval(() => {
      if (!isTyping) {
        setIsTyping(true)
        const words = ["qu", "que", "quer", "query", "query."]
        let currentIndex = 0

        const typeWord = () => {
          if (currentIndex < words.length) {
            setTypingText(words[currentIndex])
            currentIndex++
            setTimeout(typeWord, 300)
          } else {
            setTimeout(() => {
              setTypingText("")
              setIsTyping(false)
            }, 1000)
          }
        }
        typeWord()
      }
    }, 3000)

    return () => clearInterval(typingInterval)
  }, [isTyping])

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 w-full z-50 bg-black/90 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary flex items-center justify-center hover-scale">
              <Gamepad2 className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-serif text-xl font-bold text-white">qwerty.party</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10 hover-lift bg-transparent"
              asChild
            >
              <a href="https://github.com/rishabhknowss/qwerty.party" target="_blank" rel="noopener noreferrer">
                <Github className="mr-2 h-4 w-4" />
                <Star className="mr-1 h-3 w-3 text-yellow-400 fill-yellow-400" />
                Give it a star
              </a>
            </Button>
            <Button variant="secondary" size="sm" className="hover-lift">
              Join Game
            </Button>
          </div>
        </div>
      </nav>

      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-stone-50"></div>

        <div className="relative container mx-auto px-6 text-center animate-slide-up">
          <div className="max-w-4xl mx-auto">
            <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-black text-gray-900 mb-8 leading-tight">
              WORDS ARE YOUR{" "}
              <div className="inline-flex items-center">
                <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center hover-scale border-2 border-gray-300 mr-4">
                  <Gamepad2 className="h-10 w-10 text-primary-foreground" />
                </div>
                WEAPONS.
              </div>
              <br />
              <span className="text-primary">TIME TO BATTLE.</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-700 mb-12 max-w-2xl mx-auto font-medium">
              The ultimate real-time multiplayer word game that'll test your vocabulary and speed like never before.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">

              <Link href='/game'><Button
                size="lg"
                className="text-lg px-16 py-8 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold hover-lift animate-pulse-glow"
              >
                <Play className="mr-2 h-5 w-5" />
                Start Playing
              </Button></Link>
              <Button
                variant="outline"
                size="lg"
                className="text-lg px-12 py-6 bg-black text-white hover:bg-gray-900 hover-lift border-black"
                asChild
              >
                <a href="https://github.com/rishabhknowss/qwerty.party" target="_blank" rel="noopener noreferrer">
                  <Star className="mr-2 h-5 w-5 text-yellow-400 fill-yellow-400" />
                  Give it a star
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-black">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="animate-slide-up">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-white mb-6">
                REAL-TIME WORD
                <br />
                BATTLES THAT
                <br />
                <span className="text-primary">NEVER END</span>
              </h2>
              <p className="text-xl text-white/80 mb-8 leading-relaxed">
                Challenge friends or strangers in lightning-fast word games. Think bomb party meets vocabulary showdown
                - where every second counts and every letter matters.
              </p>
              <div className="flex flex-wrap gap-3">
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium hover-scale bg-white/10 text-white border-white/20"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Lightning Fast
                </Badge>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium hover-scale bg-white/10 text-white border-white/20"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Free for All
                </Badge>
                <Badge
                  variant="secondary"
                  className="px-4 py-2 text-sm font-medium hover-scale bg-white/10 text-white border-white/20"
                >
                  <Trophy className="mr-2 h-4 w-4" />
                  No Login
                </Badge>
              </div>
            </div>

            <div className="relative animate-bounce-in">
              <div className="bg-white/5 rounded-2xl p-8 border border-white/10 hover-lift">
                <div className="bg-black rounded-xl p-6 mb-4 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-medium text-white/70">Round 3 • Letters: "QU"</span>
                    <span className="text-sm font-bold text-destructive">00:0{timer}</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 hover-lift">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-xs">🍌</span>
                      </div>
                      <span className="font-medium text-white">mc adams</span>
                      <div className="flex space-x-1">
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 hover-lift">
                      <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs">🌌</span>
                      </div>
                      <span className="font-medium text-white">rishabh</span>
                      <div className="flex space-x-1">
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                        <Heart className="h-6 w-6 text-red-500 fill-red-500" />
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xs">🎮</span>
                      </div>
                      <span className="font-medium text-white/50">{typingText || "typing..."}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-4">
              MADE FOR
              <br />
              <span className="text-primary">WORD WARRIORS</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-black border-white/10 hover:border-primary/50 transition-all duration-300 group hover-lift">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors hover-scale relative border-2 border-white/20 animate-border-glow">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="font-serif text-xl text-white">Real-Time Multiplayer</CardTitle>
                <CardDescription className="text-white/70">
                  Play with your friends or invite new ones. Challenge anyone, anywhere in real-time word battles.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black border-white/10 hover:border-primary/50 transition-all duration-300 group hover-lift">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors hover-scale relative border-2 border-white/20 animate-border-glow">
                  <Crown className="h-8 w-8 text-accent" />
                </div>
                <CardTitle className="font-serif text-xl text-white">Free for All - No Login</CardTitle>
                <CardDescription className="text-white/70">
                  Jump straight into the action. No registration, no authentication, no barriers - just pure gaming fun.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-black border-white/10 hover:border-primary/50 transition-all duration-300 group hover-lift">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-chart-3/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-chart-3/20 transition-colors hover-scale relative border-2 border-white/20 animate-border-glow">
                  <Zap className="h-8 w-8 text-chart-3" />
                </div>
                <CardTitle className="font-serif text-xl text-white">Lightning Fast</CardTitle>
                <CardDescription className="text-white/70">
                  Lightning fast gameplay with zero lag. Optimized for speed and performance - every millisecond counts.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-20 discord-gradient">
        <div className="container mx-auto px-6 text-center animate-slide-up">
          <h2 className="font-serif text-4xl md:text-6xl font-black text-white mb-6">READY TO DOMINATE?</h2>
          <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto font-medium">
            Join thousands of players already battling it out. No downloads, no setup - just pure word game mayhem.
          </p>
          <Button
            size="lg"
            className="text-lg px-16 py-8 bg-white text-primary hover:bg-white/90 font-bold animate-pulse-glow hover-lift"
          >
            <Play className="mr-2 h-5 w-5" />
            Start Your First Game
          </Button>
        </div>
      </section>

      <footer className="bg-black py-16">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-primary flex items-center justify-center hover-scale">
                  <Gamepad2 className="h-5 w-5 text-primary-foreground" />
                </div>
                <span className="font-serif text-xl font-bold text-white">qwerty.party</span>
              </div>
              <p className="text-white/70 text-sm">
                The ultimate real-time multiplayer word game experience. Open source and free to play.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Game</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    How to Play
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Leaderboards
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Game Rules
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Discord Server
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Reddit
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-white/70">
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-primary transition-colors hover-lift">
                    Bug Reports
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-white/70">
              <p>&copy; 2024 Qwerty.Party. All rights reserved.</p>
              <p>Made with ❤️ for word game enthusiasts</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
