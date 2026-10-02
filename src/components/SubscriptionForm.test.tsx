import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { validate } from '../lib/validation';
import { SubscriptionForm } from './SubscriptionForm';

describe('validate', () => {
  it('requires a name, a positive cost, and a date', () => {
    expect(validate({ name: ' ', cost: '0', nextCharge: '' })).toEqual({
      name: 'Name is required.',
      cost: 'Enter a cost greater than 0.',
      nextCharge: 'Pick the next charge date.',
    });
    expect(validate({ name: 'Spotify', cost: '10.99', nextCharge: '2026-10-10' })).toEqual({});
  });
});

describe('SubscriptionForm', () => {
  it('shows errors and does not submit an empty form', async () => {
    const onSubmit = jest.fn();
    render(<SubscriptionForm onSubmit={onSubmit} />);
    await userEvent.click(screen.getByRole('button', { name: 'Add subscription' }));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid free trial with the right shape', async () => {
    const onSubmit = jest.fn();
    const { container } = render(<SubscriptionForm onSubmit={onSubmit} />);
    await userEvent.type(screen.getByPlaceholderText('Netflix'), 'Spotify');
    await userEvent.type(screen.getByPlaceholderText('15.49'), '10.99');
    await userEvent.selectOptions(screen.getAllByRole('combobox')[1], 'Music');
    await userEvent.click(screen.getByRole('checkbox', { name: /free trial/i }));
    await userEvent.type(container.querySelector('input[type="date"]') as HTMLInputElement, '2026-10-20');
    await userEvent.click(screen.getByRole('button', { name: 'Add subscription' }));
    expect(onSubmit).toHaveBeenCalledWith({
      name: 'Spotify',
      cost: 10.99,
      cycle: 'monthly',
      category: 'Music',
      nextCharge: '2026-10-20',
      isTrial: true,
    });
  });
});
