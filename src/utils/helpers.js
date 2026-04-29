export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  return phone.replace(/(\+20)(\d{3})(\d{4})(\d{4})/, '$1 $2 $3 $4');
};

export const getCurrentYear = () => {
  return new Date().getFullYear();
};

export const getCurrentSession = () => {
  const month = new Date().getMonth() + 1;
  return month <= 6 ? 1 : 2;
};

export const getSessionMonths = (session) => {
  return session === 1 ? 'January - June' : 'July - December';
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};