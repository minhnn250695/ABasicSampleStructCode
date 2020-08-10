


export const GUARDS = {
    IsClientAdminGuard: "IsClientAdminGuard",
    IsClientAdminStaffGuard: "IsClientAdminStaffGuard",
    IsClientGuard           : "IsClientGuard",
    IsPortalBusinessGuard   : "IsPortalBusinessGuard",
    IsFinpalAdminGuard      : "IsFinpalAdminGuard",
    LoginGuard              : "LoginGuard"
}

export * from './is-client-admin.service';
export * from './is-client-admin-staff.service';
export * from './is-client.service';
export * from './is-portal-business.service';
export * from './is-finpal-admin.service';
export * from './master-guard.service';
export * from './login-guard.service';