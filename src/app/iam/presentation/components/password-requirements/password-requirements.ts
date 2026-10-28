import { Component, computed, input } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { StatusChip } from '../../../../shared/presentation/components/status-chip/status-chip';
import { Tone } from '../../../../shared/presentation/components/tone-icon/tone-icon';
import { TranslatePipe } from '../../../../shared/presentation/pipes/translate.pipe';
import { PasswordPolicy } from '../../../domain/model/password-policy';

type RequirementState = 'pending' | 'met' | 'unmet';

/**
 * Displays a live checklist of the password policy (mock-ups 03 and 02a).
 */
@Component({
  selector: 'app-password-requirements',
  imports: [MatChipsModule, StatusChip, TranslatePipe],
  templateUrl: './password-requirements.html',
})
export class PasswordRequirements {
  /** Password value to evaluate against the policy. */
  readonly password = input.required<string>();

  /** Minimum number of characters required by the password policy. */
  protected readonly minimumLength = PasswordPolicy.minimumLength;
  /** Status chip tone of each requirement state. */
  protected readonly tones: Record<RequirementState, Tone> = {
    pending: 'neutral',
    met: 'success',
    unmet: 'danger',
  };
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
}
