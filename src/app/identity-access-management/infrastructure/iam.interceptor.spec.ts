import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
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
    http.get(`${environment.platformProviderApiBaseUrl}/users`).subscribe();
    const request = controller.expectOne(`${environment.platformProviderApiBaseUrl}/users`);
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-123');
    request.flush([]);
  });

  it('does not send the access token to other hosts', () => {
    http.get('./i18n/en-US.json').subscribe();
    const request = controller.expectOne('./i18n/en-US.json');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
});
