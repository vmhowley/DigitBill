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

export const checkRNC = async (rnc: string, tenantId: number) => {
    // Mock database of known RNCs for demonstration
    const MOCK_DATA: Record<string, any> = {
        '131652755': { rnc: '131652755', name: 'DIGITBILL DOMINICANA SRL', status: 'ACTIVO', type: 'JURIDICO' },
        '101017961': { rnc: '101017961', name: 'BANCO POPULAR DOMINICANO', status: 'ACTIVO', type: 'JURIDICO' },
        '101001429': { rnc: '101001429', name: 'CERVECERIA NACIONAL DOMINICANA', status: 'ACTIVO', type: 'JURIDICO' },
        '130541127': { rnc: '130541127', name: 'GOOGLE DOMINICANA SRL', status: 'ACTIVO', type: 'JURIDICO' }
    };

    try {
        if (MOCK_DATA[rnc]) {
            return MOCK_DATA[rnc];
        }

        // Simulating external delay
        await new Promise(resolve => setTimeout(resolve, 800));

        // Note: For production, this should call a real DGII endpoint or a scraping service.
        return null;
    } catch (error: any) {
        console.warn(`RNC Check failed for ${rnc}`, error.message);
        return null;
    }
};
