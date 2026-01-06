import { Router } from 'express';
import { requireAuth } from '../middleware/auth';
import { checkRNC } from '../services/dgiiService';

const router = Router();

// Protect these routes as they might consume API credits or reveals info
router.use(requireAuth);

// GET /api/dgii/rnc/:rnc
router.get('/rnc/:rnc', async (req, res) => {
    try {
        const { rnc } = req.params;
        
        if (!rnc || (rnc.length !== 9 && rnc.length !== 11)) {
            return res.status(400).json({ error: 'RNC inválido. Debe tener 9 u 11 dígitos.' });
        }

        const result = await checkRNC(rnc, req.tenantId!);
        
        if (!result) {
            return res.status(404).json({ error: 'RNC no encontrado en los registros de la DGII.' });
        }

        res.json(result);
    } catch (error: any) {
        console.error('RNC Route Error:', error);
        res.status(500).json({ error: 'Error al consultar el RNC.' });
    }
});

export default router;
