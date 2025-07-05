import * as Yup from 'yup';
import moment from 'moment-timezone';
import { generateTimezoneOptions } from '../types/slot';

const isValidDate = (value: string | undefined): boolean => {
  if (!value) return false;
  const date = moment(value, 'YYYY-MM-DD', true);
  return date.isValid();
};

const isValidTime = (value: string | undefined): boolean => {
  if (!value) return false;
  const time = moment(value, 'HH:mm', true);
  return time.isValid();
};

const isValidTimezone = (value: string | undefined): boolean => {
  if (!value) return false;
  const timezoneOptions = generateTimezoneOptions();
  return timezoneOptions.some((option: any) => option.value === value);
};

export const slotConfigValidationSchema = Yup.object().shape({
  startDate: Yup.string()
    .required('Start date is required')
    .test('is-valid-date', 'Please enter a valid date', isValidDate)
    .test('not-past', 'Start date cannot be in the past', function(value) {
      if (!value) return false;
      const inputDate = moment(value, 'YYYY-MM-DD');
      const today = moment().startOf('day');
      return inputDate.isSameOrAfter(today);
    }),
  endDate: Yup.string()
    .required('End date is required')
    .test('is-valid-date', 'Please enter a valid date', isValidDate)
    .test('after-start', 'End date must be same as or after start date', function(value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return false;
      const start = moment(startDate, 'YYYY-MM-DD');
      const end = moment(value, 'YYYY-MM-DD');
      return end.isSameOrAfter(start);
    }),
  startTime: Yup.string()
    .required('Start time is required')
    .test('is-valid-time', 'Please enter a valid time (HH:mm)', isValidTime)
    .test('valid-range', 'Time must be between 00:00 and 23:59', function(value) {
      if (!value) return false;
      const time = moment(value, 'HH:mm');
      const minTime = moment('00:00', 'HH:mm');
      const maxTime = moment('23:59', 'HH:mm');
      return time.isBetween(minTime, maxTime, null, '[]');
    }),
  endTime: Yup.string()
    .required('End time is required')
    .test('is-valid-time', 'Please enter a valid time (HH:mm)', isValidTime)
    .test('after-start-time', 'End time must be after start time', function(value) {
      const { startTime } = this.parent;
      if (!value || !startTime) return false;
      const start = moment(startTime, 'HH:mm');
      const end = moment(value, 'HH:mm');
      return end.isAfter(start);
    })
    .test('sufficient-duration', 'Time range must allow for at least one slot', function(value) {
      const { startTime, slotDuration } = this.parent;
      if (!value || !startTime || !slotDuration) return false;
      const start = moment(startTime, 'HH:mm');
      const end = moment(value, 'HH:mm');
      const durationMinutes = end.diff(start, 'minutes');
      return durationMinutes >= slotDuration;
    }),
  timeZone: Yup.string()
    .required('Timezone is required')
    .test('is-valid-timezone', 'Please select a valid timezone', isValidTimezone),
  slotDuration: Yup.number()
    .typeError('Slot duration must be a number')
    .required('Slot duration is required')
    .integer('Slot duration must be a whole number')
    .min(5, 'Slot duration must be at least 5 minutes')
    .max(480, 'Slot duration cannot exceed 8 hours (480 minutes)')
    .test('is-positive', 'Slot duration must be greater than 0', value => typeof value === 'number' && value > 0 && !isNaN(value)),
  breakDuration: Yup.number()
    .typeError('Break duration must be a number')
    .required('Break duration is required')
    .integer('Break duration must be a whole number')
    .min(0, 'Break duration cannot be negative')
    .max(120, 'Break duration cannot exceed 2 hours (120 minutes)')
    .test('is-non-negative', 'Break duration must be 0 or greater', value => typeof value === 'number' && value >= 0 && !isNaN(value)),
  bufferDuration: Yup.number()
    .typeError('Buffer duration must be a number')
    .required('Buffer duration is required')
    .integer('Buffer duration must be a whole number')
    .min(0, 'Buffer duration cannot be negative')
    .max(1440, 'Buffer duration cannot exceed 24 hours (1440 minutes)')
    .test('is-non-negative', 'Buffer duration must be 0 or greater', value => typeof value === 'number' && value >= 0 && !isNaN(value)),
});

export const fieldValidationSchemas = {
  startDate: slotConfigValidationSchema.pick(['startDate']),
  endDate: slotConfigValidationSchema.pick(['endDate']),
  startTime: slotConfigValidationSchema.pick(['startTime']),
  endTime: slotConfigValidationSchema.pick(['endTime']),
  timeZone: slotConfigValidationSchema.pick(['timeZone']),
  slotDuration: slotConfigValidationSchema.pick(['slotDuration']),
  breakDuration: slotConfigValidationSchema.pick(['breakDuration']),
  bufferDuration: slotConfigValidationSchema.pick(['bufferDuration']),
};

export const validateField = async (
  fieldName: keyof typeof fieldValidationSchemas,
  value: any,
  allValues: any
): Promise<{ isValid: boolean; error?: string }> => {
  try {
    await slotConfigValidationSchema.validateAt(fieldName, { ...allValues, [fieldName]: value });
    return { isValid: true };
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      return { isValid: false, error: error.message };
    }
    return { isValid: false, error: 'Validation error occurred' };
  }
};

export const getFormErrors = async (values: any): Promise<Record<string, string>> => {
  try {
    await slotConfigValidationSchema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (error instanceof Yup.ValidationError) {
      const errors: Record<string, string> = {};
      error.inner.forEach((err) => {
        if (err.path) {
          errors[err.path] = err.message;
        }
      });
      return errors;
    }
    return { general: 'Validation error occurred' };
  }
};

