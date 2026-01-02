import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { AdminEmailDomains } from '@/components/admin/AdminEmailDomains';
import { AdminUserRoles } from '@/components/admin/AdminUserRoles';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Shield, Users, Mail } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';

export default function Admin() {
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, isLoading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <>
      <Helmet>
        <title>Admin Dashboard - LunchLit</title>
        <meta name="description" content="Admin settings and configuration" />
      </Helmet>
      
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              <div>
                <h1 className="text-xl font-bold">Admin Dashboard</h1>
                <p className="text-sm text-muted-foreground">Manage app settings and users</p>
              </div>
            </div>
          </div>
        </header>
        
        <main className="container mx-auto px-4 py-8 max-w-5xl">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                User Roles
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Domains
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <AdminUserRoles />
            </TabsContent>
            
            <TabsContent value="domains">
              <AdminEmailDomains />
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </>
  );
}
