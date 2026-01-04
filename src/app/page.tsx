"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MessageSquare,
  TrendingUp,
  PresentationIcon,
  ArrowRight,
  Sparkles,
  Mic,
  Zap,
  Shield,
  ChevronDown,
  Check,
  Cpu,
  Phone
} from "lucide-react";


// Available OpenAI Realtime models (for WebRTC)
const AVAILABLE_MODELS = [
  {
    id: "gpt-4o-mini-realtime-preview",
    name: "GPT-4o Mini Realtime",
    description: "$10/M input • $20/M output",
    badge: "Recommandé",
    badgeColor: "bg-green-500/20 text-green-400"
  },
  {
    id: "gpt-realtime-mini",
    name: "GPT Realtime Mini",
    description: "$10/M input • $20/M output",
    badge: "Économique",
    badgeColor: "bg-blue-500/20 text-blue-400"
  },
  {
    id: "gpt-realtime",
    name: "GPT Realtime",
    description: "$32/M input • $64/M output",
    badge: "Standard",
    badgeColor: "bg-gray-500/20 text-gray-400"
  },
  {
    id: "gpt-4o-realtime-preview",
    name: "GPT-4o Realtime",
    description: "$40/M input • $80/M output",
    badge: "Premium",
    badgeColor: "bg-purple-500/20 text-purple-400"
  },
];

// Scenarios data
const SCENARIOS = [
  {
    id: "d4e5f6a7-b8c9-0123-def0-234567890123",
    title: "Client en Colère",
    description: "Gérez un client furieux qui a reçu un produit défectueux. Pratiquez votre empathie et résolution de conflits.",
    icon: MessageSquare,
    gradient: "from-red-500 via-orange-500 to-amber-500",
    glowColor: "rgba(239, 68, 68, 0.3)",
    tag: "Difficile",
    tagColor: "bg-red-500/20 text-red-400 border-red-500/30",
  },
  {
    id: "e5f6a7b8-c9d0-1234-ef01-345678901234",
    title: "Négociation Salariale",
    description: "Un employé demande une augmentation. Équilibrez le budget et la rétention des talents.",
    icon: TrendingUp,
    gradient: "from-emerald-500 via-green-500 to-teal-500",
    glowColor: "rgba(34, 197, 94, 0.3)",
    tag: "Intermédiaire",
    tagColor: "bg-green-500/20 text-green-400 border-green-500/30",
  },
  {
    id: "f6a7b8c9-d0e1-2345-f012-456789012345",
    title: "Pitch Investisseur",
    description: "Présentez votre startup à un investisseur sceptique. Défendez votre vision.",
    icon: PresentationIcon,
    gradient: "from-violet-500 via-purple-500 to-fuchsia-500",
    glowColor: "rgba(139, 92, 246, 0.3)",
    tag: "Expert",
    tagColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  },
  {
    id: "d4e5f6a7-0002-4000-8000-000000000001",
    title: "Prospection Bancaire B2B",
    description: "Décrochez un RDV avec Rachid HAMRANI, dirigeant de CLEANTECH. Présentez une proposition de valeur et gérez ses objections.",
    icon: Phone,
    gradient: "from-blue-500 via-cyan-500 to-teal-500",
    glowColor: "rgba(6, 182, 212, 0.3)",
    tag: "Commercial",
    tagColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  },
];

const FEATURES = [
  {
    icon: Mic,
    title: "Voix Naturelle",
    description: "IA conversationnelle avec voix ultra-réaliste",
  },
  {
    icon: Zap,
    title: "Temps Réel",
    description: "Latence minimale grâce à WebRTC",
  },
  {
    icon: Shield,
    title: "Sécurisé",
    description: "Vos conversations restent privées",
  },
];

export default function HomePage() {
  const [selectedModel, setSelectedModel] = useState("gpt-4o-mini-realtime-preview");
  const [showModelDropdown, setShowModelDropdown] = useState(false);

  const currentModel = AVAILABLE_MODELS.find(m => m.id === selectedModel);

  return (
    <>
      {/* Animated background */}
      <div className="gradient-bg" />

      <main className="min-h-screen min-h-dvh relative">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="container-responsive safe-area-top pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-24">
            {/* Badge */}
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 glass-card rounded-full">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">Powered by OpenAI Realtime API</span>
              </div>
            </div>

            {/* Title */}
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 tracking-tight">
                <span className="gradient-text">Coaching</span>
                <br className="sm:hidden" />
                <span className="text-white"> Simulator</span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed px-4">
                Entraînez-vous à des conversations difficiles avec une
                <span className="text-white font-medium"> IA vocale ultra-réaliste</span>.
                Parlez, écoutez, progressez.
              </p>
            </div>

            {/* Model Selector */}
            <div className="flex justify-center mt-8">
              <div className="relative">
                <button
                  onClick={() => setShowModelDropdown(!showModelDropdown)}
                  className="flex items-center gap-3 px-5 py-3 glass-card rounded-xl hover:bg-white/10 transition-all"
                >
                  <Cpu className="w-5 h-5 text-blue-400" />
                  <div className="text-left">
                    <p className="text-xs text-gray-500">Modèle IA</p>
                    <p className="text-sm font-medium text-white">{currentModel?.name}</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showModelDropdown ? "rotate-180" : ""}`} />
                </button>

                {showModelDropdown && (
                  <div className="absolute z-[100] mt-2 left-1/2 -translate-x-1/2 w-72 bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow-2xl shadow-black/50">
                    {AVAILABLE_MODELS.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => {
                          setSelectedModel(model.id);
                          setShowModelDropdown(false);
                        }}
                        className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center gap-3 ${selectedModel === model.id ? "bg-blue-500/20" : ""
                          }`}
                      >
                        <Cpu className={`w-5 h-5 ${selectedModel === model.id ? "text-blue-400" : "text-gray-500"}`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className={`text-sm font-medium ${selectedModel === model.id ? "text-blue-300" : "text-white"}`}>
                              {model.name}
                            </p>
                            <span className={`text-xs px-1.5 py-0.5 rounded ${model.badgeColor}`}>
                              {model.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{model.description}</p>
                        </div>
                        {selectedModel === model.id && (
                          <Check className="w-4 h-4 text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Features row */}
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-8 sm:mt-12 px-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-4 py-2.5 glass-card rounded-xl"
                >
                  <feature.icon className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm font-medium text-white">{feature.title}</p>
                    <p className="text-xs text-gray-500 hidden sm:block">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Scenarios Section */}
        <section className="container-responsive py-8 sm:py-12 lg:py-16">
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
              Choisissez un scénario
            </h2>
            <span className="text-sm text-gray-500 hidden sm:block">
              {SCENARIOS.length} scénarios disponibles
            </span>
          </div>

          {/* Cards Grid - Responsive */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {SCENARIOS.map((scenario) => {
              const IconComponent = scenario.icon;
              return (
                <Link
                  key={scenario.id}
                  href={`/session/${scenario.id}?model=${selectedModel}`}
                  className="group relative glass-card glass-card-hover rounded-2xl sm:rounded-3xl p-5 sm:p-6 lg:p-8 
                           transition-all duration-500 ease-out touch-feedback
                           hover:-translate-y-2 active:scale-[0.98]"
                  style={{
                    // @ts-expect-error CSS custom property
                    '--glow-color': scenario.glowColor,
                  }}
                >
                  {/* Glow effect on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      boxShadow: `0 0 60px ${scenario.glowColor}`,
                    }}
                  />

                  {/* Tag */}
                  <div className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${scenario.tagColor} mb-4`}>
                    {scenario.tag}
                  </div>

                  {/* Icon */}
                  <div className={`
                    relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl 
                    bg-gradient-to-br ${scenario.gradient}
                    flex items-center justify-center mb-4 sm:mb-5
                    shadow-lg group-hover:scale-110 transition-transform duration-300
                  `}>
                    <IconComponent className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2 group-hover:text-blue-200 transition-colors">
                    {scenario.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed mb-4 sm:mb-6">
                    {scenario.description}
                  </p>

                  {/* CTA */}
                  <div className="flex items-center gap-2 text-sm font-medium text-blue-400 group-hover:text-blue-300 transition-colors">
                    <span>Commencer</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* How it works - Mobile optimized */}
        <section className="container-responsive py-8 sm:py-12 lg:py-16 safe-area-bottom">
          <div className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 lg:p-10">
            <h3 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <span className="text-2xl">💡</span>
              Comment ça marche ?
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { step: "1", title: "Choisissez", desc: "Sélectionnez un scénario de coaching" },
                { step: "2", title: "Autorisez", desc: "Donnez accès à votre microphone" },
                { step: "3", title: "Parlez", desc: "Dialoguez naturellement avec l'IA" },
                { step: "4", title: "Progressez", desc: "Améliorez vos compétences" },
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                    {item.step}
                  </div>
                  <div>
                    <p className="font-semibold text-white mb-1">{item.title}</p>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tech badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mt-8 sm:mt-12">
            {["Next.js 15", "Supabase", "WebRTC", currentModel?.name || "GPT-4o Mini"].map((tech) => (
              <span
                key={tech}
                className="px-3 py-1.5 text-xs sm:text-sm text-gray-400 bg-white/5 rounded-full border border-white/10"
              >
                {tech}
              </span>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
