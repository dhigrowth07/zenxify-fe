import moment from 'moment';

export const formatDate = dateString => {
  const date = moment(dateString);

  if (!date.isValid()) {
    return 'Invalid Date';
  }

  return date.format('MMM D, YYYY h:mm A'); // e.g., "Oct 26, 2024 1:48 PM"
};

export const formatRelativeTime = dateString => {
  const date = moment(dateString);

  if (!date.isValid()) {
    return 'Invalid Date';
  }

  return date.fromNow(); // e.g., "5 days ago"
};

// New customizable date function
export const formatCustomDate = (
  dateString,
  formatString = 'MMM D, YYYY h:mm A'
) => {
  const date = moment(dateString);

  if (!date.isValid()) {
    return 'Invalid Date';
  }

  return date.format(formatString); // e.g., custom format string passed as argument
};
