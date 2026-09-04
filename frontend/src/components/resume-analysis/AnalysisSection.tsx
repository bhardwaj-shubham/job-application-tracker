import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type AnalysisSectionProps = {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
};

const AnalysisSection = ({
  title,
  icon,
  children,
  className,
}: AnalysisSectionProps) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>

      <CardContent>{children}</CardContent>
    </Card>
  );
};

export default AnalysisSection;
