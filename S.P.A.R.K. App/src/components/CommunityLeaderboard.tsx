import { Crown, Trophy, Medal, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar: string;
  achievement: string;
  score: number;
  badge?: string;
}

interface CommunityLeaderboardProps {
  entries: LeaderboardEntry[];
  title: string;
  className?: string;
}

export function CommunityLeaderboard({ entries, title, className }: CommunityLeaderboardProps) {
  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return Crown;
      case 2: return Trophy;
      case 3: return Medal;
      default: return Users;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return "text-spark-gold";
      case 2: return "text-muted-foreground";
      case 3: return "text-warning";
      default: return "text-muted-foreground";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-lg text-foreground">{title}</h3>
      </div>

      <div className="space-y-2">
        {entries.map((entry) => {
          const RankIcon = getRankIcon(entry.rank);
          
          return (
            <div
              key={entry.rank}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg bg-gradient-card border border-border/30",
                "hover:shadow-soft hover:border-primary/20 transition-all duration-300",
                entry.rank <= 3 && "ring-1 ring-primary/10"
              )}
            >
              {/* Rank Icon */}
              <div className={cn("flex-shrink-0", getRankColor(entry.rank))}>
                <RankIcon className="w-5 h-5" />
              </div>

              {/* Avatar */}
              <div className="flex-shrink-0">
                <img
                  src={entry.avatar}
                  alt={entry.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-border"
                />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-foreground truncate">{entry.name}</span>
                  {entry.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {entry.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{entry.achievement}</p>
              </div>

              {/* Score */}
              <div className="flex-shrink-0 text-right">
                <div className="font-bold text-primary">{entry.score.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">points</div>
              </div>

              {/* Rank Number */}
              <div className={cn(
                "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                entry.rank <= 3 
                  ? "bg-gradient-primary text-primary-foreground shadow-glow" 
                  : "bg-muted text-muted-foreground"
              )}>
                #{entry.rank}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}