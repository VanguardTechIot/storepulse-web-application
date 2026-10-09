import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslationService } from '../../../../shared/infrastructure/i18n/translation.service';
import { Callout } from '../../../../shared/presentation/components/callout/callout';
import { ToastService } from '../../../../shared/presentation/components/toast-host/toast.service';
import { LocalizedNumberPipe } from '../../../../shared/presentation/pipes/localized-number.pipe';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { SubscriptionsStore } from '../../../application/subscriptions.store';
import { BillingCycle } from '../../../domain/model/billing-cycle.enum';
import { PaymentMethod } from '../../../domain/model/payment-method.enum';
import { RequestSubscriptionCommand } from '../../../domain/model/request-subscription.command';
import { SubscriptionState } from '../../components/subscription-state/subscription-state';
import { cardExpiryValidator, cardNumberValidator } from '../../subscriptions.validators';

/**
 * Checkout of a plan: card data, total of the cycle and payment through the gateway
 * (US-44, TS-27, mock-up 11a). The subscription is activated only if the charge is accepted.
 */
@Component({
  selector: 'app-subscription-checkout',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    Callout,
    SubscriptionState,
    TranslatePipe,
    LocalizedNumberPipe,
  ],
  templateUrl: './subscription-checkout.html',
  styleUrl: '../../styles/subscriptions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubscriptionCheckout {
  protected readonly store = inject(SubscriptionsStore);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly i18n = inject(TranslationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);

  /** Plan chosen in the catalog (`/subscription/checkout/:planId?cycle=MONTHLY|ANNUAL`). */
  protected readonly planId = this.route.snapshot.paramMap.get('planId') ?? '';

  protected readonly cycles = [BillingCycle.Monthly, BillingCycle.Annual];
  protected readonly methods = [PaymentMethod.CreditCard, PaymentMethod.DebitCard];

  protected readonly form = this.fb.nonNullable.group({
    billingCycle: [this.initialCycle(), Validators.required],
    paymentMethod: [PaymentMethod.CreditCard, Validators.required],
    cardHolder: ['', [Validators.required, Validators.maxLength(80)]],
    cardNumber: ['', [Validators.required, cardNumberValidator]],
    cardExpiry: ['', [Validators.required, cardExpiryValidator]],
    cardCvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
  });

  private readonly cycle = toSignal(this.form.controls.billingCycle.valueChanges, {
    initialValue: this.form.controls.billingCycle.value,
  });

  protected readonly plan = computed(() => this.store.planById(this.planId) ?? null);
  protected readonly total = computed(() => this.plan()?.priceFor(this.cycle()) ?? null);

  constructor() {
    this.store.clearError();
    if (!this.store.loaded()) this.store.load();
  }

  protected async pay(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const done = await this.store.subscribe(
      new RequestSubscriptionCommand({
        planId: this.planId,
        billingCycle: value.billingCycle,
        paymentMethod: value.paymentMethod,
        cardNumber: value.cardNumber,
        cardExpiry: value.cardExpiry,
      }),
    );
    if (done) {
      this.toast.show('success', this.i18n.t('subscriptions.checkout.activated'));
      await this.router.navigate(['/subscription/status']);
    }
  }

  private initialCycle(): BillingCycle {
    const cycle = this.route.snapshot.queryParamMap.get('cycle');
    return cycle === BillingCycle.Annual ? BillingCycle.Annual : BillingCycle.Monthly;
  }
}
