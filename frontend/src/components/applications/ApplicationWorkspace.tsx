import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type ApplicationWorkspaceProps = {
  children: ReactNode;
};

const ApplicationWorkspace = ({ children }: ApplicationWorkspaceProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Workspace</CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">{children}</CardContent>
    </Card>
  );
};

export default ApplicationWorkspace;
