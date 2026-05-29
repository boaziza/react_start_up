import { Router } from 'express';
import { getAllPackages, createPackage, getPackageByQrCode, getPackageByCode, markPackageScanned } from '../models/packages.js';

const router = Router();

router.get('/', async (req, res) => {
    const packages = await getAllPackages();
    res.json(packages);
});

router.post('/', async (req, res) => {
    const { package_code, qr_code } = req.body;
    if (!package_code || !qr_code) return res.status(400).json({ error: 'package_code and qr_code are required' });
    try {
        const pkg = await createPackage({ package_code, qr_code });
        res.status(201).json(pkg);
    } catch (err) {
        res.status(409).json({ error: 'Package code or QR code already exists' });
    }
});

// Validate by QR code value (from camera scan)
router.get('/by-qr', async (req, res) => {
    const { qr_code } = req.query;
    if (!qr_code) return res.status(400).json({ error: 'qr_code is required' });

    const pkg = await getPackageByQrCode(qr_code);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    if (pkg.scanned) return res.status(409).json({ error: 'Package already used' });

    res.json(pkg);
});

// Validate by package code (from manual entry)
router.get('/by-code', async (req, res) => {
    const { package_code } = req.query;
    if (!package_code) return res.status(400).json({ error: 'package_code is required' });

    const pkg = await getPackageByCode(package_code);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    if (pkg.scanned) return res.status(409).json({ error: 'Package already used' });

    res.json(pkg);
});

// Mark package as scanned/used
router.patch('/:id/scan', async (req, res) => {
    const pkg = await markPackageScanned(req.params.id);
    if (!pkg) return res.status(404).json({ error: 'Package not found' });
    res.json(pkg);
});

export default router;
