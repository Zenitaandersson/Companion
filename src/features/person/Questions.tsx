import { useTranslation } from 'react-i18next';
import { BigButton } from '../../design/BigButton';
import { Screen } from '../../design/Screen';
import type { FrequentQuestion } from '../../data/types';

interface Props {
  questions: FrequentQuestion[];
  onOpen: (question: FrequentQuestion) => void;
  onBackToToday: () => void;
}

/** The person's own frequent questions as large buttons. */
export function Questions({ questions, onOpen, onBackToToday }: Props) {
  const { t } = useTranslation();
  return (
    <Screen title={t('questions.title')} onBackToToday={onBackToToday}>
      {questions.length === 0 ? (
        <p className="big-text muted">{t('questions.empty')}</p>
      ) : (
        questions.map((q) => (
          <BigButton key={q.id} onClick={() => onOpen(q)} tall>
            {q.question}
          </BigButton>
        ))
      )}
    </Screen>
  );
}
