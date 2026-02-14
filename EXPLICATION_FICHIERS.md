# 📁 VOS FICHIERS SONT ICI

Vous cherchez les fichiers "pour la création d'avatar et des decks de kanji".

Voici où ils sont dans le code (je les ai trouvés) :

### 1. Pour les Avatars 🎨
Le fichier qui contient la liste des avatars (et leurs emojis) est :
👉 `src/lib/avatars.ts`

### 2. Pour les Decks de Kanji 📚
Il n'y a **PAS** de fichier local avec la liste des Kanjis.
Le système est conçu pour les lire depuis **Supabase** (la base de données).

Le code qui gère ça est ici :
- `src/hooks/useDecks.ts` (Récupération des decks)
- `src/hooks/useKanjis.ts` (Récupération des kanjis)

**C'est pour cela que vous devez utiliser `supabase/seed.sql` :**
Ce fichier sert justement à "remplir" la base de données pour que le code puisse lire quelque chose.

---
**En résumé :**
- Modifiez `src/lib/avatars.ts` si vous voulez changer les avatars proposés.
- Exécutez `supabase/seed.sql` pour créer les Decks et Kanjis.
