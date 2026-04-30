export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

export const formatPhone = (phone) => {
  if (!phone) return '';
  // Egyptian numbers have 10 digits after +20 (e.g. +20 1xx xxx xxxx)
  return phone.replace(/(\+20)(\d{3})(\d{3})(\d{4})/, '$1 $2 $3 $4');
};

export const calculateAge = (birthdate) => {
  if (!birthdate) return 0;
  const today = new Date();
  const birth = new Date(birthdate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

export const getCurrentYear = (date = new Date()) => {
  return new Date(date).getFullYear();
};

export const getCurrentSession = (date = new Date()) => {
  const month = new Date(date).getMonth() + 1;
  return month <= 6 ? 1 : 2;
};

export const getSessionMonths = (session) => {
  return session === 1 ? 'January - June' : 'July - December';
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};