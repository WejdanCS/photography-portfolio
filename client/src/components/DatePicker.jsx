import { useEffect, useId, useRef, useState } from 'react';

const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });
const dateFormatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'long' });

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toInputValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function calendarDays(month) {
  const year = month.getFullYear();
  const monthIndex = month.getMonth();
  const firstDay = new Date(year, monthIndex, 1).getDay();
  const lastDate = new Date(year, monthIndex + 1, 0).getDate();
  const days = Array(firstDay).fill(null);

  for (let day = 1; day <= lastDate; day += 1) {
    days.push(new Date(year, monthIndex, day));
  }

  while (days.length % 7 !== 0) days.push(null);
  return days;
}

export default function DatePicker({ error, inputId, onChange }) {
  const today = startOfDay(new Date());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const [selectedDate, setSelectedDate] = useState(null);
  const [visibleMonth, setVisibleMonth] = useState(new Date(tomorrow.getFullYear(), tomorrow.getMonth(), 1));
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  const calendarId = useId();
  const hintId = `${calendarId}-hint`;
  const errorId = `${calendarId}-error`;
  const days = calendarDays(visibleMonth);
  const isCurrentMonth = visibleMonth.getFullYear() === today.getFullYear()
    && visibleMonth.getMonth() === today.getMonth();

  useEffect(() => {
    function closeCalendar(event) {
      if (event.key === 'Escape') setIsOpen(false);
      if (event.type === 'pointerdown' && !containerRef.current?.contains(event.target)) setIsOpen(false);
    }

    document.addEventListener('keydown', closeCalendar);
    document.addEventListener('pointerdown', closeCalendar);
    return () => {
      document.removeEventListener('keydown', closeCalendar);
      document.removeEventListener('pointerdown', closeCalendar);
    };
  }, []);

  function selectDate(date) {
    setSelectedDate(date);
    setIsOpen(false);
    onChange(toInputValue(date));
  }

  function clearDate() {
    setSelectedDate(null);
    onChange('');
  }

  return (
    <div className="relative" ref={containerRef}>
      <input type="hidden" name="preferredDate" value={selectedDate ? toInputValue(selectedDate) : ''} />
      <button
        id={inputId}
        className={`flex h-[3.75rem] w-full items-center justify-between gap-s border bg-background px-s text-left transition-colors hover:border-accent focus:border-text-primary ${error ? 'border-accent' : 'border-border'}`}
        type="button"
        aria-expanded={isOpen}
        aria-controls={calendarId}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
        aria-invalid={Boolean(error)}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span className={selectedDate ? 'text-text-primary' : 'text-text-secondary'}>
          {selectedDate ? dateFormatter.format(selectedDate) : 'Choose a future date'}
        </span>
        <svg className="size-m shrink-0 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M6.75 3v3m10.5-3v3M4.5 9.75h15M5.25 5.25h13.5a.75.75 0 0 1 .75.75v13.5H4.5V6a.75.75 0 0 1 .75-.75Z" />
        </svg>
      </button>

      <p className="mb-0 mt-xs text-[0.875rem] text-text-secondary" id={hintId}>Select any future day. You can also leave this blank.</p>
      {error && <p className="mb-0 mt-xs border-l-2 border-accent pl-s text-[0.875rem]" id={errorId} role="alert">{error}</p>}

      {isOpen && (
        <div className="absolute left-0 z-20 mt-xs w-full min-w-[18rem] border border-border bg-background p-s shadow-[0_1rem_3rem_rgba(26,26,26,0.12)] md:w-[22rem]" id={calendarId} role="dialog" aria-label="Choose preferred date">
          <div className="flex items-center justify-between border-b border-border pb-s">
            <button className="grid size-[2.75rem] place-items-center border border-border text-text-primary transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-30" type="button" aria-label="Previous month" disabled={isCurrentMonth} onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))}>←</button>
            <p className="m-0 font-medium" aria-live="polite">{monthFormatter.format(visibleMonth)}</p>
            <button className="grid size-[2.75rem] place-items-center border border-border text-text-primary transition-colors hover:border-accent hover:text-accent" type="button" aria-label="Next month" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))}>→</button>
          </div>

          <div className="mt-s grid grid-cols-7 gap-1 text-center" aria-hidden="true">
            {weekDays.map((day) => <span className="py-xs text-[0.75rem] font-medium uppercase tracking-label text-text-secondary" key={day}>{day.slice(0, 2)}</span>)}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((date, index) => {
              if (!date) return <span key={`empty-${index}`} />;

              const value = toInputValue(date);
              const isDisabled = date <= today;
              const isSelected = selectedDate && value === toInputValue(selectedDate);
              return (
                <button
                  className={`aspect-square min-h-[2.5rem] border text-[0.875rem] transition-colors ${isSelected ? 'border-accent bg-accent text-background' : 'border-transparent hover:border-accent'} disabled:cursor-not-allowed disabled:text-text-secondary disabled:opacity-35`}
                  type="button"
                  key={value}
                  disabled={isDisabled}
                  aria-label={dateFormatter.format(date)}
                  aria-pressed={Boolean(isSelected)}
                  onClick={() => selectDate(date)}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-s flex items-center justify-between border-t border-border pt-s">
            <span className="text-[0.75rem] uppercase tracking-label text-text-secondary">Future dates only</span>
            {selectedDate && <button className="text-[0.875rem] font-medium text-accent underline underline-offset-4" type="button" onClick={clearDate}>Clear</button>}
          </div>
        </div>
      )}
    </div>
  );
}
