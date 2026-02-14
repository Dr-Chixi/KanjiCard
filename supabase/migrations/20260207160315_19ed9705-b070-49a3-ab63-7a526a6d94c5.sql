-- Create profiles table for user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT,
  avatar_url TEXT,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_study_date DATE,
  kanjis_learned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create kanjis table (master list of all kanjis)
CREATE TABLE public.kanjis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kanji CHARACTER(1) NOT NULL UNIQUE,
  onyomi TEXT[] NOT NULL DEFAULT '{}',
  onyomi_romaji TEXT[] NOT NULL DEFAULT '{}',
  kunyomi TEXT[] NOT NULL DEFAULT '{}',
  kunyomi_romaji TEXT[] NOT NULL DEFAULT '{}',
  meaning_fr TEXT NOT NULL,
  meaning_en TEXT,
  jlpt_level INTEGER NOT NULL CHECK (jlpt_level >= 1 AND jlpt_level <= 5),
  stroke_count INTEGER,
  frequency INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on kanjis (public read access)
ALTER TABLE public.kanjis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view kanjis" ON public.kanjis FOR SELECT USING (true);

-- Create decks table
CREATE TABLE public.decks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  jlpt_level INTEGER CHECK (jlpt_level >= 1 AND jlpt_level <= 5),
  is_official BOOLEAN NOT NULL DEFAULT false,
  is_custom BOOLEAN NOT NULL DEFAULT false,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  xp_multiplier NUMERIC(3,2) NOT NULL DEFAULT 1.00,
  required_level INTEGER NOT NULL DEFAULT 1,
  kanji_count INTEGER NOT NULL DEFAULT 0,
  cover_emoji TEXT DEFAULT '📚',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on decks
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view official decks" ON public.decks FOR SELECT USING (is_official = true);
CREATE POLICY "Users can view their own custom decks" ON public.decks FOR SELECT USING (is_custom = true AND auth.uid() = user_id);
CREATE POLICY "Users can create custom decks" ON public.decks FOR INSERT WITH CHECK (is_custom = true AND auth.uid() = user_id);
CREATE POLICY "Users can update their own decks" ON public.decks FOR UPDATE USING (is_custom = true AND auth.uid() = user_id);
CREATE POLICY "Users can delete their own decks" ON public.decks FOR DELETE USING (is_custom = true AND auth.uid() = user_id);

-- Create deck_kanjis junction table
CREATE TABLE public.deck_kanjis (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  kanji_id UUID NOT NULL REFERENCES public.kanjis(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  UNIQUE(deck_id, kanji_id)
);

-- Enable RLS on deck_kanjis
ALTER TABLE public.deck_kanjis ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view deck kanjis for official decks" ON public.deck_kanjis FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.decks WHERE decks.id = deck_kanjis.deck_id AND decks.is_official = true));
CREATE POLICY "Users can view their custom deck kanjis" ON public.deck_kanjis FOR SELECT 
  USING (EXISTS (SELECT 1 FROM public.decks WHERE decks.id = deck_kanjis.deck_id AND decks.user_id = auth.uid()));
CREATE POLICY "Users can manage their deck kanjis" ON public.deck_kanjis FOR ALL 
  USING (EXISTS (SELECT 1 FROM public.decks WHERE decks.id = deck_kanjis.deck_id AND decks.user_id = auth.uid()));

-- Create user_kanji_progress table for SRS
CREATE TABLE public.user_kanji_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kanji_id UUID NOT NULL REFERENCES public.kanjis(id) ON DELETE CASCADE,
  ease_factor NUMERIC(4,2) NOT NULL DEFAULT 2.50,
  interval_days INTEGER NOT NULL DEFAULT 0,
  repetitions INTEGER NOT NULL DEFAULT 0,
  next_review_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_review_date TIMESTAMP WITH TIME ZONE,
  total_reviews INTEGER NOT NULL DEFAULT 0,
  correct_reviews INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, kanji_id)
);

-- Enable RLS on user_kanji_progress
ALTER TABLE public.user_kanji_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON public.user_kanji_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_kanji_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_kanji_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create user_deck_progress table
CREATE TABLE public.user_deck_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID NOT NULL REFERENCES public.decks(id) ON DELETE CASCADE,
  completed BOOLEAN NOT NULL DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  times_completed INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  last_studied_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, deck_id)
);

-- Enable RLS on user_deck_progress
ALTER TABLE public.user_deck_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own deck progress" ON public.user_deck_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own deck progress" ON public.user_deck_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own deck progress" ON public.user_deck_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create study_sessions table for analytics
CREATE TABLE public.study_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  deck_id UUID REFERENCES public.decks(id) ON DELETE SET NULL,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  ended_at TIMESTAMP WITH TIME ZONE,
  cards_studied INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  xp_earned INTEGER NOT NULL DEFAULT 0
);

-- Enable RLS on study_sessions
ALTER TABLE public.study_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own sessions" ON public.study_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own sessions" ON public.study_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.study_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_decks_updated_at BEFORE UPDATE ON public.decks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_kanji_progress_updated_at BEFORE UPDATE ON public.user_kanji_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_user_deck_progress_updated_at BEFORE UPDATE ON public.user_deck_progress FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for auto profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();