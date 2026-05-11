/**
 * Kullanıcı verisi: MSSQL_CONNECTION_STRING tanımlıysa SQL, değilse users.json (userStore).
 */
import * as jsonStore from "./userStore.js";
import * as sqlRepo from "./userRepositorySql.js";

export function useSqlUsers() {
  return Boolean(process.env.MSSQL_CONNECTION_STRING?.trim());
}

function j(promiseOrValue) {
  return Promise.resolve(promiseOrValue);
}

export async function findUserByEmail(email) {
  return useSqlUsers() ? sqlRepo.findUserByEmail(email) : j(jsonStore.findUserByEmail(email));
}

export async function getUserById(id) {
  return useSqlUsers() ? sqlRepo.getUserById(id) : j(jsonStore.getUserById(id));
}

export async function createUser(payload) {
  return useSqlUsers() ? sqlRepo.createUser(payload) : j(jsonStore.createUser(payload));
}

export async function listApprovedDanisanlar() {
  return useSqlUsers()
    ? sqlRepo.listApprovedDanisanlar()
    : j(jsonStore.listApprovedDanisanlar());
}

export async function setResetToken(email, resetToken, resetTokenExpiresAt) {
  return useSqlUsers()
    ? sqlRepo.setResetToken(email, resetToken, resetTokenExpiresAt)
    : j(jsonStore.setResetToken(email, resetToken, resetTokenExpiresAt));
}

export async function findUserByResetToken(token) {
  return useSqlUsers()
    ? sqlRepo.findUserByResetToken(token)
    : j(jsonStore.findUserByResetToken(token));
}

export async function updateUserPassword(userId, passwordHash) {
  return useSqlUsers()
    ? sqlRepo.updateUserPassword(userId, passwordHash)
    : j(jsonStore.updateUserPassword(userId, passwordHash));
}

export async function updateUserProfile(userId, profileData) {
  return useSqlUsers()
    ? sqlRepo.updateUserProfile(userId, profileData)
    : j(jsonStore.updateUserProfile(userId, profileData));
}

export async function updateUserHealthInfo(userId, healthData) {
  return useSqlUsers()
    ? sqlRepo.updateUserHealthInfo(userId, healthData)
    : j(jsonStore.updateUserHealthInfo(userId, healthData));
}

export async function getUserMeasurements(userId) {
  return useSqlUsers()
    ? sqlRepo.getUserMeasurements(userId)
    : j(jsonStore.getUserMeasurements(userId));
}

export async function addUserMeasurement(userId, measurementData) {
  return useSqlUsers()
    ? sqlRepo.addUserMeasurement(userId, measurementData)
    : j(jsonStore.addUserMeasurement(userId, measurementData));
}

export async function getClientsByDiyetisyenId(diyetisyenUserId) {
  return useSqlUsers()
    ? sqlRepo.getClientsByDiyetisyenId(diyetisyenUserId)
    : j(jsonStore.getClientsByDiyetisyenId(diyetisyenUserId));
}

export async function getRequestsByDiyetisyenId(diyetisyenUserId) {
  return useSqlUsers()
    ? sqlRepo.getRequestsByDiyetisyenId(diyetisyenUserId)
    : j(jsonStore.getRequestsByDiyetisyenId(diyetisyenUserId));
}

export async function approveRequest(requestId) {
  return useSqlUsers()
    ? sqlRepo.approveRequest(requestId)
    : j(jsonStore.approveRequest(requestId));
}

export async function rejectRequest(requestId) {
  return useSqlUsers()
    ? sqlRepo.rejectRequest(requestId)
    : j(jsonStore.rejectRequest(requestId));
}

export async function createRequest(danisanId, diyetisyenId) {
  return useSqlUsers()
    ? sqlRepo.createRequest(danisanId, diyetisyenId)
    : j(jsonStore.createRequest(danisanId, diyetisyenId));
}

export async function listPendingDietitianAccounts() {
  return useSqlUsers()
    ? sqlRepo.listPendingDietitianAccounts()
    : j(jsonStore.listPendingDietitianAccounts());
}

export async function setDietitianAccountStatus(userId, statusCode) {
  return useSqlUsers()
    ? sqlRepo.setDietitianAccountStatus(userId, statusCode)
    : j(jsonStore.setDietitianAccountStatus(userId, statusCode));
}
