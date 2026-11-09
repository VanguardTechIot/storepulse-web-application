import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { IamStore } from '../application/iam.store';
import { Role } from '../domain/model/role.enum';
import { UserAccount } from '../domain/model/user-account.entity';
import { UserSession } from '../domain/model/user-session.value-object';
import { UserStatus } from '../domain/model/user-status.enum';
import { authenticationInterceptor } from './iam.interceptor';
import { IamSessionStorage } from './iam-session-storage';

describe('authenticationInterceptor', () => {
  let http: HttpClient;
  let controller: HttpTestingController;
  let sessionStorage: IamSessionStorage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authenticationInterceptor])),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    http = TestBed.inject(HttpClient);
    controller = TestBed.inject(HttpTestingController);
    sessionStorage = TestBed.inject(IamSessionStorage);
    sessionStorage.save(
      new UserSession({
        user: new UserAccount({
          id: 'usr-001',
          email: 'admin@gallery.pe',
          role: Role.GalleryAdministrator,
          status: UserStatus.Active,
        }),
        accessToken: 'token-123',
      }),
      false,
    );
  });

  afterEach(() => {
    sessionStorage.clear();
    controller.verify();
  });

  it('sends the access token to the StorePulse API', () => {
    http.get(`${environment.platformProviderApiBaseUrl}/alerts`).subscribe();
    const request = controller.expectOne(`${environment.platformProviderApiBaseUrl}/alerts`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    request.flush([]);
  });

  it('does not send the access token to other hosts', () => {
    http.get('./i18n/en-US.json').subscribe();
    const request = controller.expectOne('./i18n/en-US.json');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });

  it('closes the session and goes to sign-in when the API rejects the token', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    const store = TestBed.inject(IamStore);
    http.get(`${environment.platformProviderApiBaseUrl}/alerts`).subscribe({ error: () => {} });
    controller
      .expectOne(`${environment.platformProviderApiBaseUrl}/alerts`)
      .flush(null, { status: 401, statusText: 'Unauthorized' });
    expect(store.isSignedIn()).toBe(false);
    expect(sessionStorage.accessToken()).toBeNull();
    expect(navigate).toHaveBeenCalledWith(['/iam', 'sign-in'], { queryParams: { returnUrl: '/' } });
  });
});
