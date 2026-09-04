import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type MatchScoreProps = {
  score: number | null;
};

const MatchScore = ({ score }: MatchScoreProps) => {
  if (score === null) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resume Match</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm text-muted-foreground">
            Match score is unavailable.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Resume Match</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-end gap-2">
          <span className="text-5xl font-bold tracking-tight">{score}%</span>

          <span className="pb-1 text-sm text-muted-foreground">match</span>
        </div>

        <div className="space-y-2">
          <div className="h-3 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.min(Math.max(score, 0), 100)}%` }}
            />
          </div>

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Low match</span>
            <span>Strong match</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MatchScore;
