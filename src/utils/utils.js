export const addHoursToDateStr = (dateStr, hours) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    date.setHours(date.getHours() + hours);
    
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    const h = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    
    return `${y}-${m}-${d}T${h}:${min}`;
  };
  export const getMinDateTime = (type='now',formData) => {
    let date;
  if (type=='now'){
  date = new Date();
  date.setHours(date.getHours() + 12);
  }
  else{
    date = new Date(formData.fromDate);
    if(formData.reservationType === 'Full Day'){
    date.setHours(date.getHours() + formData.fullDayHours);}
    else{
      date.setHours(date.getHours() + 1);
    }
  }


  // Add 12 hours buffer
  
 
  
  
  const pad = (num) => String(num).padStart(2, '0');
  const y = date.getFullYear();
  const m = pad(date.getMonth() + 1);
  const d = pad(date.getDate());
  const hh = pad(date.getHours());
  const mm = pad(date.getMinutes());
  
  
  // Returns format: 2026-03-31T05:21
  
  return `${y}-${m}-${d}T${hh}:${mm}`;
  
  };