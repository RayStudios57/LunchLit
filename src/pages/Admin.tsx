import { useAuth } from '@/contexts/AuthContext';
import { useUserRoles } from '@/hooks/useUserRoles';
import { AdminEmailDomains } from '@/components/admin/AdminEmailDomains';
import { AdminUserRoles } from '@/components/admin/AdminUserRoles';
import { AdminSchools } from '@/components/admin/AdminSchools';
import { AdminMealManagement } from '@/components/admin/AdminMealManagement';
import { AdminProfiles } from '@/components/admin/AdminProfiles';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Loader2, Shield, Users, Mail, School, Utensils, UserCheck } from 'lucide-react';
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
        
        <main className="container mx-auto px-4 py-8 max-w-6xl">
          <Tabs defaultValue="users" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Roles</span>
              </TabsTrigger>
              <TabsTrigger value="profiles" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                <span className="hidden sm:inline">Profiles</span>
              </TabsTrigger>
              <TabsTrigger value="schools" className="flex items-center gap-2">
                <School className="h-4 w-4" />
                <span className="hidden sm:inline">Schools</span>
              </TabsTrigger>
              <TabsTrigger value="meals" className="flex items-center gap-2">
                <Utensils className="h-4 w-4" />
                <span className="hidden sm:inline">Meals</span>
              </TabsTrigger>
              <TabsTrigger value="domains" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span className="hidden sm:inline">Domains</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="users">
              <AdminUserRoles />
            </TabsContent>

            <TabsContent value="profiles">
              <AdminProfiles />
            </TabsContent>

            <TabsContent value="schools">
              <AdminSchools />
            </TabsContent>

            <TabsContent value="meals">
              <AdminMealManagement />
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