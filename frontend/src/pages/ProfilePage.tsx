import useAuth from "@/hooks/useAuth";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProfilePage = () => {
  const { user } = useAuth();

  const memberSince = new Date(user.createdAt).toLocaleDateString();

  return (
    <section className="mx-auto w-full max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your account information.
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Account information</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              <AvatarFallback className="text-xl">
                {user.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-semibold">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 border-t pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="mt-1 font-medium">{user.name}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="mt-1 font-medium">{user.email}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Member since</p>
              <p className="mt-1 font-medium">{memberSince}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

export default ProfilePage;
