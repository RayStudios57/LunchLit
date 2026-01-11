import { useAuditLog } from '@/hooks/useAuditLog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, History, UserPlus, UserMinus, Edit, Users, Shield, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

const ACTION_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  role_added: { label: 'Role Added', icon: UserPlus, color: 'bg-green-500/10 text-green-600' },
  role_removed: { label: 'Role Removed', icon: UserMinus, color: 'bg-red-500/10 text-red-600' },
  role_updated: { label: 'Role Updated', icon: Edit, color: 'bg-blue-500/10 text-blue-600' },
  permission_changed: { label: 'Permission Changed', icon: Shield, color: 'bg-purple-500/10 text-purple-600' },
  bulk_assignment: { label: 'Bulk Assignment', icon: Users, color: 'bg-orange-500/10 text-orange-600' },
  custom_role_created: { label: 'Custom Role Created', icon: Plus, color: 'bg-emerald-500/10 text-emerald-600' },
  custom_role_updated: { label: 'Custom Role Updated', icon: Edit, color: 'bg-cyan-500/10 text-cyan-600' },
  custom_role_deleted: { label: 'Custom Role Deleted', icon: Trash2, color: 'bg-rose-500/10 text-rose-600' },
};

export function AuditLogView() {
  const { auditLogs, isLoading } = useAuditLog();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Audit Log
        </CardTitle>
        <CardDescription>
          Track all role changes, permission modifications, and admin actions
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : auditLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No audit logs yet.</p>
            <p className="text-sm">Actions will be recorded here as they happen.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Action</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLogs.map((log) => {
                  const config = ACTION_CONFIG[log.action_type] || {
                    label: log.action_type,
                    icon: History,
                    color: 'bg-gray-500/10 text-gray-600',
                  };
                  const Icon = config.icon;

                  return (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded ${config.color}`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          <span className="font-medium text-sm">{config.label}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {log.details?.target_email && (
                            <Badge variant="outline" className="text-xs">
                              User: {log.details.target_email}
                            </Badge>
                          )}
                          {log.details?.role_name && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              Role: {log.details.role_name}
                            </Badge>
                          )}
                          {log.details?.affected_count && (
                            <Badge variant="secondary" className="text-xs ml-1">
                              {log.details.affected_count} users affected
                            </Badge>
                          )}
                          {log.details?.changes && (
                            <p className="text-xs text-muted-foreground">
                              {JSON.stringify(log.details.changes)}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {format(new Date(log.created_at), 'MMM d, h:mm a')}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
