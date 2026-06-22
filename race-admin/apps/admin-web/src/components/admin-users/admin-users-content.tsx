import type { ColumnDef } from '@tanstack/react-table';
import { Check, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';

import { Role } from '@race/types';
import type { AdminUserListItem, RolePermissionCard } from '@race/types';
import { formatDateTime } from '@race/utils';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ErrorState,
  LoadingState,
  StatusBadge,
} from '@race/ui';

import { ConfirmDialog } from '@/components/shared/modal';
import { DataTable } from '@/components/shared/data-table';
import { EntityFormModal } from '@/components/shared/entity-form-modal';
import { RowActionsMenu } from '@/components/shared/row-actions-menu';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useAdminUserMutations } from '@/hooks/use-admin-mutations';
import { useAdminUsers } from '@/hooks/use-admin-users';

const ADMIN_FIELDS = [
  { name: 'name', label: 'Full Name', required: true },
  { name: 'email', label: 'Email', type: 'email' as const, required: true },
  {
    name: 'role',
    label: 'Role',
    type: 'select' as const,
    options: Object.values(Role).map((r) => ({
      label: r.replace(/_/g, ' '),
      value: r,
    })),
  },
  {
    name: 'status',
    label: 'Status',
    type: 'select' as const,
    options: [
      { label: 'Active', value: 'ACTIVE' },
      { label: 'Inactive', value: 'INACTIVE' },
    ],
  },
];

function formatRole(role: string) {
  return role.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function RoleCard({ role }: { role: RolePermissionCard }) {
  return (
    <Card className="flex flex-col">
      <CardHeader className="border-b border-primary/30 pb-3">
        <CardTitle className="text-base text-primary">{role.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col pt-4">
        <ul className="mb-6 space-y-2">
          {role.permissions.map((perm) => (
            <li key={perm} className="flex items-center gap-2 text-sm text-body">
              <Check className="h-4 w-4 shrink-0 text-success" />
              {perm}
            </li>
          ))}
        </ul>
        <Button variant="outline" className="mt-auto w-full">
          Manage Permissions
        </Button>
      </CardContent>
    </Card>
  );
}

export function AdminUsersContent() {
  const { data, isLoading, isError, refetch } = useAdminUsers();
  const { create, update, remove } = useAdminUserMutations();
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<AdminUserListItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AdminUserListItem | null>(null);

  const columns = useMemo<ColumnDef<AdminUserListItem, unknown>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <UserAvatar name={row.original.name} size="sm" />
            <span className="font-medium">{row.original.name}</span>
          </div>
        ),
      },
      { accessorKey: 'email', header: 'Email' },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => formatRole(row.original.role),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'lastLogin',
        header: 'Last Login',
        cell: ({ row }) => (
          <span className="text-body">{formatDateTime(row.original.lastLogin)}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActionsMenu
            onEdit={() => {
              setEditing(row.original);
              setFormOpen(true);
            }}
            onDelete={() => setDeleteTarget(row.original)}
          />
        ),
      },
    ],
    [],
  );

  if (isLoading) return <LoadingState message="Loading admin users..." />;
  if (isError || !data) {
    return <ErrorState message="Failed to load admin users" onRetry={() => void refetch()} />;
  }

  return (
    <>
      <div className="space-y-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Admin Users</CardTitle>
            <Button
              className="gap-2"
              onClick={() => {
                setEditing(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Admin
            </Button>
          </CardHeader>
          <CardContent className="p-0 pb-2">
            <DataTable
              columns={columns}
              data={data.users}
              emptyMessage="No admin users"
              getRowId={(row) => row.id}
            />
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-4 text-lg font-bold text-heading">Roles & Permissions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {data.roles.map((role) => (
              <RoleCard key={role.role} role={role} />
            ))}
          </div>
        </div>
      </div>

      <EntityFormModal
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
        }}
        title={editing ? 'Edit Admin User' : 'Add Admin User'}
        fields={ADMIN_FIELDS}
        initialValues={
          editing
            ? {
                name: editing.name,
                email: editing.email,
                role: editing.role,
                status: editing.status,
              }
            : { role: Role.OPERATIONS_ADMIN, status: 'ACTIVE' }
        }
        onSubmit={async (values) => {
          const payload = {
            name: values.name,
            email: values.email,
            role: values.role as AdminUserListItem['role'],
            status: values.status as AdminUserListItem['status'],
          };
          if (editing) await update.mutateAsync({ id: editing.id, data: payload });
          else await create.mutateAsync(payload);
          setFormOpen(false);
          setEditing(null);
        }}
        loading={create.isPending || update.isPending}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Admin User"
        message={`Delete ${deleteTarget?.name}?`}
        onConfirm={async () => {
          if (deleteTarget) {
            try {
              await remove.mutateAsync(deleteTarget.id);
              setDeleteTarget(null);
            } catch (e) {
              alert(e instanceof Error ? e.message : 'Delete failed');
            }
          }
        }}
        loading={remove.isPending}
      />
    </>
  );
}
