import Reservation from '../models/Reservation.js';
import Availability from '../models/Availability.js';

export async function checkBoatAvailability(boatId, startDate, endDate, excludeReservationId = null) {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const overlappingReservations = await Reservation.find({
    boat: boatId,
    status: { $nin: ['cancelled'] },
    $or: [{ startDate: { $lt: end }, endDate: { $gt: start } }],
    ...(excludeReservationId ? { _id: { $ne: excludeReservationId } } : {}),
  });

  if (overlappingReservations.length > 0) {
    return { available: false, reason: 'Boat already reserved for these dates' };
  }

  const blockedPeriods = await Availability.find({
    boat: boatId,
    startDate: { $lt: end },
    endDate: { $gt: start },
  });

  if (blockedPeriods.length > 0) {
    return { available: false, reason: `Boat unavailable: ${blockedPeriods[0].reason || blockedPeriods[0].type}` };
  }

  return { available: true };
}

export function calculateDays(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diff = end - start;
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}
