import React from 'react';
import { usePage } from '@inertiajs/react';
import AdminDashboard from '@/Pages/Admin/Dashboard';

export default function LangitLensAdminLayout({ title = 'LangitLens AI', children }) {
    const { adminPortal } = usePage().props;

    return (
        <AdminDashboard {...adminPortal} portalTitle={title}>
            {children}
        </AdminDashboard>
    );
}
