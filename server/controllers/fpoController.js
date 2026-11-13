import SellRequest from '../models/SellRequest.js';
import CropLot from '../models/CropLot.js';
import { isDbConnected } from '../config/db.js';
import { store } from '../store.js';

function computeCommissionBreakdown(finalProduceValue) {
  const fpoCommission = Math.round(finalProduceValue * 0.015 * 100) / 100;
  const platformCommission = Math.round(finalProduceValue * 0.01 * 100) / 100;
  const sellerPayout = Math.round((finalProduceValue - fpoCommission - platformCommission) * 100) / 100;
  return {
    finalProduceValue,
    sellerPayout,
    fpoCommission,
    platformCommission,
    sellerPayoutPercentage: 97.5,
    fpoCommissionPercentage: 1.5,
    platformCommissionPercentage: 1,
  };
}

async function persistSellRequestUpdate(reqItem) {
  if (!isDbConnected()) return;
  try {
    await SellRequest.updateOne(
      { id: reqItem.id },
      { $set: reqItem },
      { upsert: true }
    );
  } catch (e) {
    // non-blocking
  }
}

export async function getFpoOfficers(req, res) {
  try {
    res.json(store.fpoOfficers || []);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch FPO officers' });
  }
}

export async function getSellRequests(req, res) {
  try {
    const { farmerId, sellerId, status, crop, fpoOfficerId } = req.query;
    const effectiveSellerId = sellerId || farmerId;

    if (isDbConnected()) {
      try {
        const filter = {};
        if (effectiveSellerId) {
          filter.$or = [{ sellerId: effectiveSellerId }, { farmerId: effectiveSellerId }];
        }
        if (status && status !== 'All') filter.status = status;
        if (crop && crop !== 'All') {
          filter.$or = filter.$or || [];
          const cropRegex = new RegExp(crop, 'i');
          filter.$and = [{ $or: [{ crop: cropRegex }, { cropName: cropRegex }] }];
        }
        if (fpoOfficerId) filter['assignedFpoOfficer.id'] = fpoOfficerId;

        const requests = await SellRequest.find(filter).sort({ createdAt: -1 });
        if (Array.isArray(requests) && requests.length > 0) {
          return res.json(requests);
        }
      } catch (e) {
        // Fallback to in-memory store
      }
    }

    let list = [...store.sellRequests];
    if (effectiveSellerId) {
      list = list.filter((r) => r.sellerId === effectiveSellerId || r.farmerId === effectiveSellerId);
    }
    if (status && status !== 'All') list = list.filter((r) => r.status === status);
    if (crop && crop !== 'All') {
      list = list.filter((r) => (r.crop || r.cropName || '').toLowerCase().includes(crop.toLowerCase()));
    }
    if (fpoOfficerId) {
      list = list.filter(
        (r) => r.assignedFpoOfficer?.id === fpoOfficerId || r.fpoOfficerId === fpoOfficerId
      );
    }

    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sell requests' });
  }
}

export async function createSellRequest(req, res) {
  try {
    const data = req.body;
    const cropName = data.crop || data.cropName || 'Cotton';
    const reqId = `REQ-${cropName.substring(0, 3).toUpperCase()}-${Date.now().toString().slice(-5)}`;
    const quantity = Number(data.quantity) || 10;
    const expectedPrice = Number(data.expectedPricePerUnit || data.expectedPricePerQuintal) || 2500;
    const totalAmount = Math.round(quantity * expectedPrice * 100) / 100;
    const now = new Date().toISOString();

    const sellerId = data.sellerId || data.farmerId || req.user?.id || 'usr-farmer';
    const sellerName = data.sellerName || data.farmerName || req.user?.name || 'Farmer';
    const sellerPhone = data.sellerPhone || data.farmerPhone || req.user?.phone || '+91 90000 00000';
    const district = data.sellerLocation?.district || 'Warangal';

    const officers = store.fpoOfficers || [];
    const assignedOfficer =
      officers.find((o) => o.district.toLowerCase() === district.toLowerCase()) ||
      officers[0] || {
        id: data.fpoOfficerId || 'fpo-off-1',
        name: data.fpoOfficerName || 'Srinivas Rao (Warangal Agri Cluster)',
        phone: '+91 98481 12345',
        fpoOrganization: data.fpoName || 'Rythu Mithra Farmer Producer Company Ltd',
        district,
        state: data.sellerLocation?.state || 'Telangana',
        rating: 4.9,
      };

    const commissions = computeCommissionBreakdown(totalAmount);

    const newReq = {
      id: reqId,
      sellerId,
      farmerId: sellerId,
      sellerName,
      farmerName: sellerName,
      sellerPhone,
      farmerPhone: sellerPhone,
      farmerLocation: data.sellerLocation?.address || data.farmerLocation || `${district}, Telangana`,
      crop: cropName,
      cropName,
      variety: data.variety || `${cropName} Standard`,
      quantity,
      unit: data.unit || 'Quintals',
      grade: data.qualityDetails?.grade || data.grade || 'A',
      expectedPricePerUnit: expectedPrice,
      expectedPricePerQuintal: expectedPrice,
      expectedTotalAmount: totalAmount,
      totalExpectedAmount: totalAmount,
      imageUrl: data.imageUrl || data.photos?.[0] || 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?w=600&auto=format&fit=crop&q=80',
      photos: data.photos || (data.imageUrl ? [data.imageUrl] : []),
      qualityDetails: {
        grade: data.qualityDetails?.grade || data.grade || 'A',
        moisture: Number(data.qualityDetails?.moisture) || 8.5,
        harvestDate: data.qualityDetails?.harvestDate || now.split('T')[0],
        notes: data.qualityDetails?.notes || 'Clean picked produce ready for FPO physical inspection.',
      },
      sellerLocation: data.sellerLocation || {
        address: data.farmerLocation || 'Telangana Farm Gate',
        district,
        state: 'Telangana',
      },
      fpoCommissionPct: 1.5,
      fpoCommissionAmount: commissions.fpoCommission,
      kisanSetuFeeAmount: commissions.platformCommission,
      netFarmerPayable: commissions.sellerPayout,
      fpoOfficerId: assignedOfficer.id,
      fpoOfficerName: assignedOfficer.name,
      fpoName: assignedOfficer.fpoOrganization,
      assignedFpoOfficer: assignedOfficer,
      status: 'pending_fpo',
      statusLogs: [
        {
          status: 'pending_fpo',
          timestamp: now,
          note: `Sell request created by ${sellerName} for ${quantity} ${data.unit || 'Quintals'} of ${cropName}.`,
          actorRole: 'seller',
          actorName: sellerName,
        },
        {
          status: 'pending_fpo',
          timestamp: now,
          note: `Nearby FPO Officer ${assignedOfficer.name} assigned. Contact: ${assignedOfficer.phone}.`,
          actorRole: 'system',
          actorName: 'KisanSetu Dispatch Engine',
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    store.sellRequests.unshift(newReq);

    if (isDbConnected()) {
      try {
        await new SellRequest(newReq).save();
      } catch (err) {
        console.warn('MongoDB save sell request notice:', err.message);
      }
    }

    res.status(201).json({ success: true, sellRequest: newReq, ...newReq });
  } catch (error) {
    console.error('Error creating sell request:', error);
    res.status(500).json({ error: error.message || 'Failed to submit sell request' });
  }
}

export async function updateSellRequest(req, res) {
  try {
    const item = store.sellRequests.find((r) => r.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    Object.assign(item, req.body, { updatedAt: new Date().toISOString() });
    await persistSellRequestUpdate(item);

    res.json({ success: true, sellRequest: item, ...item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update sell request' });
  }
}

async function findSellRequestById(id) {
  let item = store.sellRequests.find((r) => r.id === id);
  if (!item && isDbConnected()) {
    try {
      const dbDoc = await SellRequest.findOne({ id });
      if (dbDoc) {
        item = dbDoc.toObject();
        store.sellRequests.unshift(item);
      }
    } catch {
      // non-blocking
    }
  }
  return item;
}

export async function acceptSellRequest(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    const officerName = req.body?.officerName || item.assignedFpoOfficer?.name || 'FPO Officer';
    item.status = 'fpo_accepted';
    item.updatedAt = now;
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'fpo_accepted',
      timestamp: now,
      note: `FPO Officer ${officerName} accepted the sell request and verified farmer contact.`,
      actorRole: 'fpo',
      actorName: officerName,
    });

    await persistSellRequestUpdate(item);
    res.json({ success: true, sellRequest: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to accept sell request' });
  }
}

export async function travelToSeller(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    const officerName = req.body?.officerName || item.assignedFpoOfficer?.name || 'FPO Officer';
    const etaMinutes = Number(req.body?.etaMinutes) || 25;
    item.status = 'fpo_traveling';
    item.updatedAt = now;
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'fpo_traveling',
      timestamp: now,
      note: `FPO Officer ${officerName} dispatched to farm gate (ETA: ${etaMinutes} mins).`,
      actorRole: 'fpo',
      actorName: officerName,
    });

    await persistSellRequestUpdate(item);
    res.json({ success: true, sellRequest: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update travel status' });
  }
}

export async function inspectSellRequest(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    const data = req.body || {};
    const officerName = data.officerName || item.assignedFpoOfficer?.name || 'FPO Officer';
    item.status = 'inspecting';
    item.updatedAt = now;
    item.inspection = {
      inspectedAt: now,
      officerId: data.officerId || item.assignedFpoOfficer?.id || 'fpo-off-1',
      officerName,
      grade: data.grade || 'A',
      moisturePercentage: Number(data.moisturePercentage) || 8.5,
      foreignMatterPercentage: Number(data.foreignMatterPercentage) || 1.0,
      qualityNotes: data.qualityNotes || 'Physical produce inspection verified and passed.',
      inspectionPhotoUrl: data.inspectionPhotoUrl || item.imageUrl,
      verifiedPass: true,
    };
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'inspecting',
      timestamp: now,
      note: `Physical inspection passed (Grade ${item.inspection.grade}, Moisture ${item.inspection.moisturePercentage}%). Verified by ${officerName}.`,
      actorRole: 'fpo',
      actorName: officerName,
    });

    await persistSellRequestUpdate(item);
    res.json({ success: true, sellRequest: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to submit physical inspection' });
  }
}

export async function negotiateSellPrice(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    const finalPricePerUnit = Number(req.body?.finalPricePerUnit) || item.expectedPricePerUnit || 5000;
    const finalProduceValue = Math.round((Number(item.quantity) || 1) * finalPricePerUnit * 100) / 100;
    const breakdown = computeCommissionBreakdown(finalProduceValue);

    item.status = 'price_agreed';
    item.finalPricePerUnit = finalPricePerUnit;
    item.finalProduceValue = finalProduceValue;
    item.commissionBreakdown = breakdown;
    item.fpoCommissionAmount = breakdown.fpoCommission;
    item.kisanSetuFeeAmount = breakdown.platformCommission;
    item.netFarmerPayable = breakdown.sellerPayout;
    item.updatedAt = now;
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'price_agreed',
      timestamp: now,
      note: `Final price agreed at ₹${finalPricePerUnit}/${item.unit}. Value: ₹${finalProduceValue} (Seller ₹${breakdown.sellerPayout} · FPO ₹${breakdown.fpoCommission} · App ₹${breakdown.platformCommission}).`,
      actorRole: 'fpo',
      actorName: item.assignedFpoOfficer?.name || 'FPO Officer',
    });

    await persistSellRequestUpdate(item);
    res.json({ success: true, sellRequest: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to negotiate price' });
  }
}

export async function selectSellTransport(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    const data = req.body || {};
    item.status = 'transport_selected';
    item.transport = {
      type: data.type || 'app_logistics',
      transporterName: data.transporterName || 'AgriVerse Express Rural Logistics',
      vehicleNumber: data.vehicleNumber || 'TS 03 UB 4419',
      driverName: data.driverName || 'Raju Goud',
      driverPhone: data.driverPhone || '+91 97001 88990',
      vehicleType: data.vehicleType || 'Tata 407 (2.5 Ton)',
      estimatedFreight: Number(data.estimatedFreight ?? 1400),
      pickupTime: now,
      trackingStatus: 'Transport assigned & ready for pickup',
    };
    if (data.destinationMarket) item.destinationMarket = data.destinationMarket;
    if (data.buyerName) item.buyerName = data.buyerName;
    if (data.buyerCompany) item.buyerCompany = data.buyerCompany;
    item.updatedAt = now;
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'transport_selected',
      timestamp: now,
      note: `Transport selected: ${item.transport.transporterName} (${item.transport.vehicleNumber}).`,
      actorRole: 'seller',
      actorName: item.sellerName || 'Farmer',
    });

    await persistSellRequestUpdate(item);
    res.json({ success: true, sellRequest: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to select transportation' });
  }
}

export async function dispatchSellProduce(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    item.status = 'in_transit';
    item.updatedAt = now;
    if (item.transport) item.transport.trackingStatus = 'In Transit to APMC Market Yard';
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'in_transit',
      timestamp: now,
      note: `Produce loaded & dispatched toward ${item.destinationMarket || 'APMC Market Yard'}.`,
      actorRole: 'transporter',
      actorName: item.transport?.driverName || 'Assigned Driver',
    });

    await persistSellRequestUpdate(item);
    res.json({ success: true, sellRequest: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to dispatch produce' });
  }
}

export async function deliverSellProduce(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    if (req.body?.destinationMarket) item.destinationMarket = req.body.destinationMarket;
    if (req.body?.buyerName) item.buyerName = req.body.buyerName;
    item.status = 'delivered';
    item.updatedAt = now;
    if (item.transport) item.transport.trackingStatus = 'Delivered at destination mandi';
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'delivered',
      timestamp: now,
      note: `Produce delivered at ${item.destinationMarket || 'APMC Market Yard'}${item.buyerName ? ` (${item.buyerName})` : ''}.`,
      actorRole: 'buyer',
      actorName: item.buyerName || item.buyerCompany || 'Market Buyer',
    });

    await persistSellRequestUpdate(item);
    res.json({ success: true, sellRequest: item });
  } catch (error) {
    res.status(500).json({ error: 'Failed to mark produce delivered' });
  }
}

export async function completeSellTransaction(req, res) {
  try {
    const item = await findSellRequestById(req.params.id);
    if (!item) return res.status(404).json({ error: 'Sell request not found' });

    const now = new Date().toISOString();
    const finalProduceValue =
      item.finalProduceValue ||
      Math.round((Number(item.quantity) || 1) * (Number(item.finalPricePerUnit || item.expectedPricePerUnit) || 5000) * 100) / 100;
    const commissionSummary = item.commissionBreakdown || computeCommissionBreakdown(finalProduceValue);

    item.status = 'completed';
    item.finalProduceValue = finalProduceValue;
    item.commissionBreakdown = commissionSummary;
    item.paymentSettled = true;
    item.paymentSettledAt = now;
    item.paymentStatus = 'payout_released';
    item.updatedAt = now;
    item.statusLogs = item.statusLogs || [];
    item.statusLogs.push({
      status: 'completed',
      timestamp: now,
      note: `Transaction completed! Seller Payout: ₹${commissionSummary.sellerPayout} (97.5%), FPO Officer: ₹${commissionSummary.fpoCommission} (1.5%), Platform: ₹${commissionSummary.platformCommission} (1%).`,
      actorRole: 'admin',
      actorName: 'KisanSetu Settlement Engine',
    });

    await persistSellRequestUpdate(item);
    res.json({
      success: true,
      sellRequest: item,
      commissionSummary,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to complete transaction' });
  }
}

export async function aggregateRequests(req, res) {
  try {
    const { requestIds, bulkCropName } = req.body;
    if (!requestIds || !requestIds.length) {
      return res.status(400).json({ error: 'No sell requests selected for aggregation' });
    }

    const items = store.sellRequests.filter((r) => requestIds.includes(r.id));
    const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);
    const avgPrice = items.length
      ? Math.round(
          items.reduce(
            (sum, item) => sum + (Number(item.expectedPricePerUnit || item.expectedPricePerQuintal) || 2500),
            0
          ) / items.length
        )
      : 2500;

    const bulkLotId = `LOT-BULK-${Date.now().toString().slice(-5)}`;
    const bulkLot = {
      id: bulkLotId,
      farmerId: 'FPO-COOP-AGGREGATE',
      farmerName: 'Warangal Progressive Farmers Producer Co. (Aggregated Lot)',
      farmerPhone: '+91 98491 56789',
      crop: bulkCropName || items[0]?.crop || items[0]?.cropName || 'Cotton',
      quantity: totalQty || 50,
      unit: 'Quintals',
      grade: 'A',
      expectedPrice: avgPrice,
      location: 'FPO Central Collection Hub, Warangal',
      status: 'available',
      isBulkLot: true,
      aggregatedFrom: requestIds,
      physicalQualityCheckedByFPO: true,
      createdAt: new Date().toISOString(),
    };

    store.cropLots.unshift(bulkLot);
    items.forEach((item) => {
      item.status = 'aggregated';
      item.assignedLotId = bulkLotId;
    });

    if (isDbConnected()) {
      try {
        await new CropLot(bulkLot).save();
        await SellRequest.updateMany(
          { id: { $in: requestIds } },
          { $set: { status: 'aggregated', assignedLotId: bulkLotId } }
        );
      } catch (e) {
        // non-blocking
      }
    }

    res.json({ success: true, bulkLot, aggregatedCount: items.length });
  } catch (error) {
    console.error('Aggregation error:', error);
    res.status(500).json({ error: 'Aggregation failed' });
  }
}

