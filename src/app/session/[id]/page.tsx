import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import VoiceSession from "@/components/VoiceSession";
import type { Scenario } from "@/types";

const SCENARIOS: Record<string, Scenario> = {
    "d4e5f6a7-b8c9-0123-def0-234567890123": {
        id: "d4e5f6a7-b8c9-0123-def0-234567890123",
        title: "Client en Colère",
        description: "Gérez un client furieux qui a reçu un produit défectueux. Pratiquez votre empathie et résolution de conflits.",
        persona_id: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    },
    "e5f6a7b8-c9d0-1234-ef01-345678901234": {
        id: "e5f6a7b8-c9d0-1234-ef01-345678901234",
        title: "Négociation Salariale",
        description: "Un employé demande une augmentation. Équilibrez le budget et la rétention des talents.",
        persona_id: "b2c3d4e5-f6a7-8901-bcde-f12345678901",
    },
    "f6a7b8c9-d0e1-2345-f012-456789012345": {
        id: "f6a7b8c9-d0e1-2345-f012-456789012345",
        title: "Pitch Investisseur",
        description: "Présentez votre startup à un investisseur sceptique. Défendez votre vision.",
        persona_id: "c3d4e5f6-a7b8-9012-cdef-123456789012",
    },
    "d4e5f6a7-0002-4000-8000-000000000001": {
        id: "d4e5f6a7-0002-4000-8000-000000000001",
        title: "Prospection Bancaire B2B",
        description: "Décrochez un RDV avec Rachid HAMRANI, dirigeant de CLEANTECH. Présentez une proposition de valeur et gérez ses objections.",
        persona_id: "d4e5f6a7-0001-4000-8000-000000000001",
    },
};

interface PageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ model?: string }>;
}

export default async function SessionPage({ params, searchParams }: PageProps) {
    const { id } = await params;
    const { model } = await searchParams;
    const scenario = SCENARIOS[id];

    // Get model from query params, default to mini
    const selectedModel = model || "gpt-4o-mini-realtime-preview";

    if (!scenario) {
        return (
            <>
                <div className="gradient-bg" />
                <main className="min-h-screen min-h-dvh flex items-center justify-center p-4">
                    <div className="text-center glass-card rounded-3xl p-8 sm:p-12 max-w-md">
                        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-6">
                            <span className="text-3xl">❌</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-3">Scénario introuvable</h1>
                        <p className="text-gray-400 mb-8">Ce scénario n&apos;existe pas ou a été supprimé.</p>
                        <Link
                            href="/"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 
                       hover:from-blue-400 hover:to-purple-400 text-white font-medium rounded-full 
                       transition-all duration-300 hover:scale-105"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Retour à l&apos;accueil
                        </Link>
                    </div>
                </main>
            </>
        );
    }

    // Get model display name
    const modelName = selectedModel === "gpt-4o-realtime-preview" ? "GPT-4o" : "GPT-4o Mini";

    return (
        <>
            {/* Animated background */}
            <div className="gradient-bg" />

            <main className="min-h-screen min-h-dvh relative flex flex-col">
                {/* Header */}
                <header className="sticky top-0 z-50 safe-area-top">
                    <div className="glass-card border-t-0 border-l-0 border-r-0 rounded-none">
                        <div className="container-responsive py-3 sm:py-4 flex items-center justify-between">
                            {/* <Link
                                href="/"
                                className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors 
                         px-3 py-2 -ml-3 rounded-lg hover:bg-white/5"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="text-sm sm:text-base font-medium">Retour</span>
                            </Link> */}

                            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
                                <Sparkles className="w-4 h-4 text-blue-400" />
                                <span className="hidden sm:inline">{modelName}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center">
                    <VoiceSession scenario={scenario} model={selectedModel} />
                </div>

                {/* Decorative elements */}
                <div className="fixed top-1/4 -left-32 w-64 h-64 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="fixed bottom-1/4 -right-32 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
            </main>
        </>
    );
}
