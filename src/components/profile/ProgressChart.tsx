import { useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, subDays, startOfDay, isSameDay } from "date-fns";
import { fr } from "date-fns/locale";

interface StudySession {
  id: string;
  started_at: string;
  xp_earned: number;
  cards_studied: number;
}

interface ProgressChartProps {
  sessions: StudySession[];
}

export default function ProgressChart({ sessions }: ProgressChartProps) {
  const chartData = useMemo(() => {
    const today = startOfDay(new Date());
    const data = [];

    for (let i = 29; i >= 0; i--) {
      const date = subDays(today, i);
      const daySessions = sessions.filter((s) =>
        isSameDay(new Date(s.started_at), date)
      );
      const xp = daySessions.reduce((sum, s) => sum + s.xp_earned, 0);
      const cards = daySessions.reduce((sum, s) => sum + s.cards_studied, 0);

      data.push({
        date: format(date, "d MMM", { locale: fr }),
        shortDate: format(date, "d", { locale: fr }),
        xp,
        cards,
        fullDate: format(date, "EEEE d MMMM", { locale: fr }),
      });
    }

    return data;
  }, [sessions]);

  const maxXp = Math.max(...chartData.map((d) => d.xp), 50);

  if (sessions.length === 0) {
    return (
      <div className="h-32 flex items-center justify-center text-muted-foreground text-sm">
        Pas encore de données. Commence à étudier !
      </div>
    );
  }

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="shortDate"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            interval="preserveStartEnd"
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
            domain={[0, maxXp]}
            width={30}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="glass-card rounded-lg p-2 text-xs shadow-lg border">
                    <p className="font-medium capitalize">{data.fullDate}</p>
                    <p className="text-xp">+{data.xp} XP</p>
                    <p className="text-muted-foreground">{data.cards} cartes</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="xp"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#xpGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
