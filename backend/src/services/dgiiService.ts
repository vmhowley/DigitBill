import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const DGII_URLS = {
  test: 'https://ecf.dgii.gov.do/testecf', 
  prod: 'https://ecf.dgii.gov.do/ecf'
};

const getBaseUrl = () => {
  return process.env.DGII_ENV === 'prod' ? DGII_URLS.prod : DGII_URLS.test;
};

// Cache token per tenant
const tokenCache = new Map<number, { token: string, expiry: number }>();

const getAuthToken = async (tenantId: number) => {
  // Check if we have valid token
  const cached = tokenCache.get(tenantId);
  if (cached && Date.now() < cached.expiry) {
    return cached.token;
  }

  const baseUrl = getBaseUrl();
  
  try {
    // 1. Get Seed
    const seedResp = await axios.get(`${baseUrl}/autenticacion/api/semilla`);
    const seedXml = seedResp.data;

    // 2. Sign Seed
    // Load config from DB
    const { getCompanyConfig } = require('./configService');
    const config = await getCompanyConfig(tenantId);

    const { loadP12, signXml } = require('./signatureService');
    
    // Check if cert file exists handled by loadP12 ? loadP12 throws if file not found
    const { privateKeyPem, certPem } = loadP12(config.certificate_path, config.certificate_password);
    
    // Sign the seed XML. Usually the seed root is <SemillaModel>
    const signedSeed = signXml(seedXml, privateKeyPem, certPem, "//*[local-name(.)='SemillaModel']");

    // 3. Validate Seed and Get Token
    const tokenResp = await axios.post(`${baseUrl}/autenticacion/api/validarsemilla`, signedSeed, {
      headers: { 'Content-Type': 'application/xml' }
    });

    // Response structure varies, often: { token: "...", expire: "..." }
    const token = tokenResp.data.token || tokenResp.data; 
    
    tokenCache.set(tenantId, {
        token,
        expiry: Date.now() + (55 * 60 * 1000)
    });
    
    return token;
  } catch (err: any) {
    console.error('DGII Auth Error:', err.response?.data || err.message);
    throw new Error('Authentication with DGII failed');
  }
};

export const sendToDGII = async (signedXml: string, tenantId: number) => {
  const token = await getAuthToken(tenantId);
  const url = `${getBaseUrl()}/recepcionfc/api/ecf`; // Double check this endpoint in docs
  
  try {
    const response = await axios.post(url, signedXml, {
      headers: {
        'Content-Type': 'application/xml',
        'Authorization': `Bearer ${token}` 
      },
      timeout: 30000
    });
    return response.data; // trackId
  } catch (error: any) {
    console.error('Error sending to DGII:', error.response?.data || error.message);
    throw new Error('Failed to send to DGII');
  }
};

export const checkStatusDGII = async (trackId: string, tenantId: number) => {
  const token = await getAuthToken(tenantId);
  const url = `${getBaseUrl()}/recepcionfc/api/consultatrackid/${trackId}`;
  
  try {
    const response = await axios.get(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.data;
  } catch (error: any) {
    console.error('Error checking status:', error.response?.data || error.message);
    throw new Error('Failed to check status');
  }
};

// Helper to validate RNC (Companies)
const isValidRNC = (rnc: string): boolean => {
  if (rnc.length !== 9) return false;

  const weights = [7, 9, 8, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 8; i++) {
    const digit = parseInt(rnc[i]);
    if (isNaN(digit)) return false;
    sum += digit * weights[i];
  }

  const remainder = sum % 11;
  let checkDigit = 0;

  if (remainder === 0) checkDigit = 2;
  else if (remainder === 1) checkDigit = 1;
  else checkDigit = 11 - remainder;

  return checkDigit === parseInt(rnc[8]);
};

// Helper to validate Cédula (Individuals) - Luhn Algorithm
const isValidCedula = (cedula: string): boolean => {
  if (cedula.length !== 11) return false;

  let sum = 0;
  const weights = [1, 2, 1, 2, 1, 2, 1, 2, 1, 2];

  for (let i = 0; i < 10; i++) {
    const digit = parseInt(cedula[i]);
    if (isNaN(digit)) return false;
    
    let product = digit * weights[i];
    if (product >= 10) {
      const pStr = product.toString();
      product = parseInt(pStr[0]) + parseInt(pStr[1]);
    }
    sum += product;
  }

  const checkDigit = (10 - (sum % 10)) % 10;
  return checkDigit === parseInt(cedula[10]);
};

export const checkRNC = async (rnc: string, tenantId: number) => {
    try {
        // Strip any non-numeric characters just in case
        const cleanRnc = rnc.replace(/[^\d]/g, '');

        let isValid = false;
        let type = '';

        if (cleanRnc.length === 9) {
            isValid = isValidRNC(cleanRnc);
            type = 'JURIDICO'; // Corporate/Company
        } else if (cleanRnc.length === 11) {
            isValid = isValidCedula(cleanRnc);
            type = 'FISICA'; // Individual
        }

        if (!isValid) {
            // Invalid checksum or length
            return null;
        }

        // Return a valid object. 
        // NOTE: Since we don't have an open DGII API, we return a blank name 
        // to let the user fill it in, but we CONFIRM the RNC format is valid.
        return {
            rnc: cleanRnc,
            name: '', // The frontend should enable the name input if this is empty
            status: 'ACTIVO', // Assumed active to allow creation. 
            type: type,
            isVerified: false // Flag to seek manual verification if needed
        };

    } catch (error: any) {
        console.warn(`RNC Check error for ${rnc}`, error.message);
        return null;
    }
};
