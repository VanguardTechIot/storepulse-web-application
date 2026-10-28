import { Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PasswordPolicy } from '../../../domain/model/password-policy';

type RequirementState = 'pending' | 'met' | 'unmet';

/**
 * Displays a live checklist of the password policy (mock-ups 03 and 02a).
 */
@Component({
  selector: 'app-password-requirements',
  imports: [MatIconModule, MatListModule, TranslatePipe],
  templateUrl: './password-requirements.html',
  styleUrl: './password-requirements.css',
})
export class PasswordRequirements {
  /** Password value to evaluate against the policy. */
  readonly password = input.required<string>();

  /** Minimum number of characters required by the password policy. */
  protected readonly minimumLength = PasswordPolicy.minimumLength;
  /** Current state of each password policy requirement. */
  protected readonly requirements = computed(() => {
    const password = this.password();
    const evaluation = PasswordPolicy.evaluate(password);
    const state = (met: boolean): RequirementState => (met ? 'met' : password ? 'unmet' : 'pending');
    return [
      { key: 'minimum_length', state: state(evaluation.hasMinimumLength) },
      { key: 'number', state: state(evaluation.hasNumber) },
    ];
  });

  /**
   * Gets the Material icon name for a requirement state.
   *
   * @param state - Current requirement state.
   * @returns Icon name representing the state.
   */
  protected icon(state: RequirementState): string {
    return { pending: 'radio_button_unchecked', met: 'check_circle', unmet: 'cancel' }[state];
  }
}
