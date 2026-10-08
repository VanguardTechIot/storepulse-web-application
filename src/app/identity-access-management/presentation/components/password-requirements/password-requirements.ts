import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '@ngx-translate/core';
import { PasswordPolicy } from '../../../domain/model/password-policy';

type RequirementState = 'pending' | 'met' | 'unmet';

/**
 * Live checklist of the password policy (mock-ups 03 and 02a).
 */
@Component({
  selector: 'app-password-requirements',
  imports: [MatIconModule, MatListModule, TranslatePipe],
  templateUrl: './password-requirements.html',
  styleUrl: './password-requirements.css',
})
export class PasswordRequirements {
  readonly password = input.required<string>();

  protected readonly minimumLength = PasswordPolicy.minimumLength;
  protected readonly requirements = computed(() => {
    const password = this.password();
    const evaluation = PasswordPolicy.evaluate(password);
    const state = (met: boolean): RequirementState => (met ? 'met' : password ? 'unmet' : 'pending');
    return [
      { key: 'minimum-length', state: state(evaluation.hasMinimumLength) },
      { key: 'number', state: state(evaluation.hasNumber) },
    ];
  });

  protected icon(state: RequirementState): string {
    return { pending: 'radio_button_unchecked', met: 'check_circle', unmet: 'cancel' }[state];
  }
}
