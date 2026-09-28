import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { Profile } from '../../data/types';
import { DEFAULT_PROFILE } from '../../data/types';
import { Today } from './Today';

const profile: Profile = { ...DEFAULT_PROFILE, name: 'Erik', homeLabel: 'at home in Lerum' };

describe('Today screen', () => {
  const now = new Date(2026, 8, 29, 14, 15); // Tuesday afternoon

  it('shows name, day, time of day, place and next thing', () => {
    render(
      <Today
        profile={profile}
        steps={[]}
        events={[{ id: 1, date: '2026-09-29', time: '15:00', text: 'Anna comes' }]}
        now={now}
        onNavigate={() => undefined}
        onEnterCarer={() => undefined}
      />,
    );
    const card = screen.getByTestId('today-card');
    expect(card.textContent).toContain('Hello Erik');
    expect(card.textContent).toContain('Tuesday afternoon');
    expect(card.textContent).toContain('You are at home in Lerum');
    expect(card.textContent).toContain('Anna comes at');
  });

  it('navigates to every section with one tap', () => {
    const onNavigate = vi.fn();
    render(<Today profile={profile} steps={[]} events={[]} now={now} onNavigate={onNavigate} onEnterCarer={() => undefined} />);
    fireEvent.click(screen.getByRole('button', { name: /People/ }));
    fireEvent.click(screen.getByRole('button', { name: /My day/ }));
    fireEvent.click(screen.getByRole('button', { name: /Questions/ }));
    fireEvent.click(screen.getByRole('button', { name: /My life/ }));
    fireEvent.click(screen.getByRole('button', { name: /Help/ }));
    expect(onNavigate.mock.calls.map((c) => c[0])).toEqual(['people', 'myDay', 'questions', 'myLife', 'help']);
  });

  it('keeps the bottom bar in place and marks Today as current', () => {
    render(<Today profile={profile} steps={[]} events={[]} now={now} onNavigate={() => undefined} onEnterCarer={() => undefined} />);
    expect(screen.getByTestId('back-to-today').getAttribute('aria-current')).toBe('page');
  });

  it('offers a single-tap carer entry', () => {
    const onEnterCarer = vi.fn();
    render(<Today profile={profile} steps={[]} events={[]} now={now} onNavigate={() => undefined} onEnterCarer={onEnterCarer} />);
    fireEvent.click(screen.getByRole('button', { name: /For carers/ }));
    expect(onEnterCarer).toHaveBeenCalledTimes(1);
  });
});
