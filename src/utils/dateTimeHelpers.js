// utils/dateTimeHelpers.js

export function parseISOToFormFields(isoStart, isoEnd) {
  const start = new Date(isoStart);
  const end = new Date(isoEnd);

  return {
    date: start.toISOString().slice(0, 10), // yyyy-mm-dd voor input[type="date"]
    endDate: end.toISOString().slice(0, 10),
    startTime: start.toTimeString().slice(0, 5), // hh:mm
    endTime: end.toTimeString().slice(0, 5),
  };
}

export function formFieldsToISO(date, startTime, endDate, endTime) {
  const start = new Date(`${date}T${startTime}`);
  const end = new Date(`${endDate}T${endTime}`);

  return {
    startTime: start.toISOString(),
    endTime: end.toISOString(),
  };
}
