export default function timestampFormatter(inputDate?: string) {
  const now = inputDate ? new Date(inputDate) : new Date();

  // Helper to pad numbers (e.g., 3 -> '03')
  const pad = (num: number, length: number = 2) =>
    num.toString().padStart(length, '0');

  // Date Components
  const year = now.getFullYear();
  const month = pad(now.getMonth() + 1);
  const day = pad(now.getDate());

  // Time Components
  const hour = pad(now.getHours());
  const minute = pad(now.getMinutes());
  const second = pad(now.getSeconds());
  const millisecond = pad(now.getMilliseconds(), 3); // Must be 3 digits

  // Construct the safe file name timestamp
  const timestamp = `${year}${month}${day}_${hour}${minute}${second}_${millisecond}`;

  return timestamp;
}
