import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("No authorization header");
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "",
      {
        global: { headers: { Authorization: authHeader } },
      }
    );

    // Get user
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error("Unauthorized");
    }

    // Get user profile
    const { data: profile } = await supabaseClient
      .from("profiles")
      .select("*")
      .eq("user_id", user.id)
      .single();

    // Get user's deck progress
    const { data: deckProgress } = await supabaseClient
      .from("user_deck_progress")
      .select("deck_id, completed, times_completed, last_studied_at")
      .eq("user_id", user.id);

    // Get available decks
    const { data: decks } = await supabaseClient
      .from("decks")
      .select("*")
      .eq("is_official", true)
      .lte("required_level", profile?.current_level || 1)
      .order("required_level", { ascending: true });

    // Get kanji progress for SRS suggestions
    const { data: kanjiProgress } = await supabaseClient
      .from("user_kanji_progress")
      .select("kanji_id, next_review_date, repetitions")
      .eq("user_id", user.id)
      .lte("next_review_date", new Date().toISOString())
      .order("next_review_date", { ascending: true })
      .limit(10);

    // Build context for AI
    const context = {
      level: profile?.current_level || 1,
      totalXp: profile?.total_xp || 0,
      kanjisLearned: profile?.kanjis_learned || 0,
      currentStreak: profile?.current_streak || 0,
      completedDecks: deckProgress?.filter(d => d.completed).map(d => d.deck_id) || [],
      pendingReviews: kanjiProgress?.length || 0,
      availableDecks: decks?.map(d => ({
        id: d.id,
        name: d.name,
        jlptLevel: d.jlpt_level,
        kanjiCount: d.kanji_count,
        completed: deckProgress?.find(p => p.deck_id === d.id)?.completed || false,
      })) || [],
    };

    // Call AI for multiple suggestions
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("KANJICARD_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.0-flash",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant expert en pédagogie japonaise pour l'app KanjiCard. 
            Tu dois fournir exactement 3 suggestions d'apprentissage courtes et motivantes sous forme d'un tableau JSON.
            Chaque suggestion doit avoir:
            - type: "review", "learn", ou "challenge"
            - title: Un titre court (ex: "Révision Flash", "Nouveau Kanji", "Défi du Jour")
            - message: Le texte d'encouragement (max 15 mots)
            - deckId: L'ID d'un deck suggéré (parmi ceux fournis) ou null.
            
            Adapte le ton au niveau de l'utilisateur:
            - Débutant (Level 1-2): Très encourageant, focus sur les bases.
            - Intermédiaire (Level 3-5): Focus sur la régularité et le SRS.
            - Avancé (Level 6+): Focus sur la maîtrise et le perfectionnement.
            
            Réponds uniquement avec le JSON valide.`
          },
          {
            role: "user",
            content: `Profil: Level ${context.level}, ${context.kanjisLearned} kanjis appris, ${context.pendingReviews} révisions en attente.
            Decks disponibles: ${JSON.stringify(context.availableDecks.slice(0, 5))}
            
            Génère les 3 suggestions.`
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    let recommendations = [];

    if (aiResponse.ok) {
      const aiData = await aiResponse.json();
      try {
        const content = aiData.choices?.[0]?.message?.content;
        const parsed = JSON.parse(content);
        recommendations = Array.isArray(parsed) ? parsed : (parsed.suggestions || parsed.recommendations || []);
      } catch (e) {
        console.error("AI JSON parse error:", e);
      }
    }

    // Fallback logic if AI fails or returns empty
    if (recommendations.length === 0) {
      if (context.pendingReviews > 0) {
        recommendations.push({
          type: "review",
          title: "Révision Prioritaire",
          message: `${context.pendingReviews} kanjis t'attendent pour ne pas les oublier ! 🧠`,
          deckId: context.availableDecks.find(d => !d.completed)?.id || context.availableDecks[0]?.id
        });
      }

      const nextDeck = context.availableDecks.find(d => !d.completed);
      if (nextDeck) {
        recommendations.push({
          type: "learn",
          title: "Nouvelle Étape",
          message: `Prêt à découvrir de nouveaux kanjis dans ${nextDeck.name} ? 🚀`,
          deckId: nextDeck.id
        });
      }

      recommendations.push({
        type: "challenge",
        title: "Perfectionnement",
        message: "Repasse un deck déjà terminé pour ancrer tes connaissances ! ✨",
        deckId: context.availableDecks[0]?.id
      });
    }

    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        recommendations: [
          {
            type: "challenge",
            title: "Continue !",
            message: "Continue ton apprentissage, tu progresses bien ! 🌸",
            deckId: null
          }
        ]
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
