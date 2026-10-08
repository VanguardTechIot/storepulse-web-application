import { Role } from './role.enum';
import { UserAccount } from './user-account.entity';
import { UserStatus } from './user-status.enum';

describe('UserAccount', () => {
  function account(role: Role, status: UserStatus): UserAccount {
    return new UserAccount({ id: 'usr-001', email: 'admin@gallery.pe', role, status });
  }

  it('lets an active gallery administrator use the web application', () => {
    expect(account(Role.GalleryAdministrator, UserStatus.Active).canAccessWebApplication()).toBe(
      true,
    );
  });

  it('keeps tenants out of the web application', () => {
    expect(account(Role.Tenant, UserStatus.Active).canAccessWebApplication()).toBe(false);
  });

  it('keeps inactive accounts out of the web application', () => {
    expect(account(Role.GalleryAdministrator, UserStatus.Inactive).canAccessWebApplication()).toBe(
      false,
    );
  });
});
